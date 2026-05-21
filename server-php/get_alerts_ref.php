<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

/**
 * Many hosts load `connection.php` after `db.conn.php` and overwrite `$db` with mysqli.
 * Capture the PDO handle immediately after `db.conn.php` so alerts always use PDO.
 */
include 'inc/db.conn.php';

if (!isset($db) || !($db instanceof PDO)) {
  error_log('get_alerts_ref: after db.conn.php, $db is not PDO.');
  echo json_encode([
    'status' => 'error',
    'msg'    => 'Server configuration error (db.conn: $db must be PDO).',
  ]);
  exit;
}

$pdoAlerts = $db;

include '../include/connection.php';

function getForestTypeByBeatPdo(PDO $pdo, ?string $beat): array
{
  if ($beat === null || $beat === '') {
    return [];
  }
  try {
    $stmt = $pdo->prepare('SELECT ft_type, area FROM tbl_forest_type WHERE beat = ? LIMIT 1');
    if ($stmt === false) {
      error_log('getForestTypeByBeatPdo: prepare() returned false');
      return [];
    }
    $stmt->execute([$beat]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return is_array($row) ? $row : [];
  } catch (Throwable $e) {
    error_log('getForestTypeByBeatPdo: ' . $e->getMessage());
    return [];
  }
}

function getUserAuthData(PDO $pdo, string $token): ?array
{
  $sql = "
    SELECT 
      users.type,
      user_auth.district,
      divison.name AS division_name
    FROM user_auth
    LEFT JOIN users ON users.user_id = user_auth.user_id
    LEFT JOIN divison ON divison.id = user_auth.division_id
    WHERE user_auth.token = ?
  ";

  $stmt = $pdo->prepare($sql);
  if ($stmt === false) {
    throw new RuntimeException('getUserAuthData: prepare() failed');
  }
  $stmt->execute([$token]);
  return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}

function getLastThreeDaysDate(): string
{
  return date('Y-m-d', strtotime('-3 days'));
}

function fetchAlertsForHeadQuarter(PDO $pdo): PDOStatement
{
  $daysAgo = getLastThreeDaysDate();
  $sql = 'SELECT * FROM alerts WHERE datetime > ? ORDER BY id DESC';

  $stmt = $pdo->prepare($sql);
  if ($stmt === false) {
    throw new RuntimeException('fetchAlertsForHeadQuarter: prepare() failed');
  }
  $stmt->execute([$daysAgo]);
  return $stmt;
}

function fetchAlertsByDivision(PDO $pdo, string $division): PDOStatement
{
  if (isset($_GET['all'])) {
    $stmt = $pdo->prepare('SELECT * FROM alerts ORDER BY id DESC');
    if ($stmt === false) {
      throw new RuntimeException('fetchAlertsByDivision(all): prepare() failed');
    }
    $stmt->execute();
    return $stmt;
  }

  $daysAgo = getLastThreeDaysDate();
  $stmt = $pdo->prepare(
    'SELECT * FROM alerts WHERE division = ? AND datetime > ? ORDER BY id DESC'
  );
  if ($stmt === false) {
    throw new RuntimeException('fetchAlertsByDivision: prepare() failed');
  }
  $stmt->execute([$division, $daysAgo]);
  return $stmt;
}

function fetchAlertsByDistrict(PDO $pdo, string $district): PDOStatement
{
  $daysAgo = getLastThreeDaysDate();
  $stmt = $pdo->prepare(
    'SELECT * FROM alerts WHERE district = ? AND datetime > ? ORDER BY id DESC'
  );
  if ($stmt === false) {
    throw new RuntimeException('fetchAlertsByDistrict: prepare() failed');
  }
  $stmt->execute([$district, $daysAgo]);
  return $stmt;
}

function mapAlertRow(PDO $pdo, array $alert): stdClass
{
  $forest = getForestTypeByBeatPdo($pdo, $alert['beat'] ?? null);

  $data = new stdClass();
  /** DB column is `id`; app expects `alert_id`. */
  $data->alert_id = $alert['id'] ?? $alert['alert_id'] ?? null;
  $data->lat = $alert['lat'];
  $data->lng = $alert['lng'];
  $data->status = $alert['status'];
  $data->range_name = $alert['range_name'];
  $data->beat = $alert['beat'];
  $data->handler = $alert['handler'];
  $data->remarks = $alert['remarks'];
  $data->datetime = $alert['datetime'];
  /** Capture time for map popup (DB: `acq_date` and/or `alert_captured`). */
  $data->alertCaptured = $alert['alertCaptured']
    ?? $alert['alert_captured']
    ?? $alert['acq_date']
    ?? null;
  $data->acq_date = $alert['acq_date'] ?? $data->alertCaptured;
  $data->division = $alert['division'];
  $data->ft_type = $forest['ft_type'] ?? null;
  $data->submitted_by = $alert['submitted_by'];

  return $data;
}

function successResponse(array $alerts): void
{
  $flags = 0;
  if (defined('JSON_INVALID_UTF8_SUBSTITUTE')) {
    $flags |= JSON_INVALID_UTF8_SUBSTITUTE;
  }
  if (defined('JSON_PARTIAL_OUTPUT_ON_ERROR')) {
    $flags |= JSON_PARTIAL_OUTPUT_ON_ERROR;
  }
  $payload = (object)[
    'status'   => 'success',
    'msg'      => 'Total Active Alerts : ' . count($alerts),
    'alerts'   => $alerts,
    'apiBuild' => 'get_alerts_ref v6-alertCaptured',
  ];
  $json = json_encode($payload, $flags);
  if ($json === false) {
    error_log('successResponse: json_encode failed');
    errorResponse('Could not encode alerts JSON');
    return;
  }
  echo $json;
}

function errorResponse(string $message): void
{
  $flags = defined('JSON_INVALID_UTF8_SUBSTITUTE') ? JSON_INVALID_UTF8_SUBSTITUTE : 0;
  echo json_encode([
    'status'   => 'error',
    'msg'      => $message,
    'apiBuild' => 'get_alerts_ref v6-alertCaptured',
  ], $flags);
}

if (!isset($_POST['unique_id'])) {
  errorResponse('Unauthorized Access!');
  exit;
}

$token = trim((string) $_POST['unique_id']);
if ($token === '') {
  errorResponse('Unauthorized Access!');
  exit;
}

try {
  $auth = getUserAuthData($pdoAlerts, $token);

  if (!$auth) {
    errorResponse('Unauthorized Access!');
    exit;
  }

  $userType = strtolower((string) ($auth['type'] ?? ''));
  $district = isset($auth['district']) ? trim((string) $auth['district']) : '';
  $divisionName = isset($auth['division_name']) ? trim((string) $auth['division_name']) : '';

  if ($userType === 'sdrf' || $userType === 'revenue') {
    if ($district === '') {
      successResponse([]);
      exit;
    }
    $stmt = fetchAlertsByDistrict($pdoAlerts, $district);
  } elseif ($divisionName === 'FOREST HEAD QUARTER') {
    $stmt = fetchAlertsForHeadQuarter($pdoAlerts);
  } else {
    if ($divisionName === '') {
      error_log('get_alerts_ref: user has empty division_name; token prefix: ' . substr($token, 0, 8));
      successResponse([]);
      exit;
    }
    $stmt = fetchAlertsByDivision($pdoAlerts, $divisionName);
  }

  $alertRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  $alerts = [];

  foreach ($alertRows as $row) {
    if (!is_array($row)) {
      continue;
    }
    try {
      $alerts[] = mapAlertRow($pdoAlerts, $row);
    } catch (Throwable $rowEx) {
      error_log('get_alerts_ref mapAlertRow row: ' . $rowEx->getMessage());
    }
  }

  successResponse($alerts);
} catch (Throwable $e) {
  error_log('get_alerts_ref: ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
  error_log($e->getTraceAsString());
  errorResponse('Something went wrong and active alerts were not loaded');
}
