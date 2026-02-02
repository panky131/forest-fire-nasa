import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  StyleSheet
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import URLs from '@/utils/URLs';
import { moderateScale } from '@/utils/Metrics';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface FormState {
  division?: string;
  range_name?: string;
  beat_name?: string;
  description?: string;
}

const API_URL = `${URLs.api_base_url}announcements/create.php`;

const DIVISIONS = [
  'FOREST HEAD QUARTER',
  'NORTH DIVISION',
  'SOUTH DIVISION',
  'EAST DIVISION',
  'WEST DIVISION'
];

export interface Division {
  id: number;
  name: string;
}

const CreateAnnouncementModal: React.FC<Props> = ({ visible, onClose }) => {
  const [form, setForm] = useState<FormState>({});
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loadingDivisions, setLoadingDivisions] = useState<boolean>(false);

  const DIVISION_API = `${URLs.api_base_url}announcements/division_list.php`;


  const capturePhoto = async (): Promise<void> => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const submit = async (): Promise<void> => {
    if (!form.division || !form.range_name || !form.beat_name || !form.description) {
      Alert.alert('Please fill all fields');
      return;
    }

    if (!image) {
      Alert.alert('Please capture a photo');
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location permission is required');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setSubmitting(true);

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    data.append('latitude', String(location.coords.latitude));
    data.append('longitude', String(location.coords.longitude));

    data.append('image', {
      uri: image.uri,
      name: 'photo.jpg',
      type: 'image/jpeg'
    } as any);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: data
      });

      const json = await res.json();
      if (json.status === 'success') {
        onClose();
      } else {
        Alert.alert(json.msg);
      }
    }
    catch (err) {
      console.error(err);
      Alert.alert('Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const loadDivisions = async () => {
      setLoadingDivisions(true);
      try {
        const res = await fetch(DIVISION_API);
        const json = await res.json();

        if (json.status === 'success') {
          setDivisions(json.divisions);
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Failed to load divisions');
      } finally {
        setLoadingDivisions(false);
      }
    };

    loadDivisions();
  }, []);


  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Announcement</Text>

        <Text style={styles.label}>Division</Text>
        <View style={styles.pickerContainer}>
          <Picker
            style={{ fontSize: moderateScale(10) }}
            selectedValue={form.division}
            onValueChange={(value) =>
              setForm({ ...form, division: value })
            }
          >
            <Picker.Item
              label={loadingDivisions ? 'Loading divisions...' : 'Select division'}
              value={undefined}
            />

            {divisions.map((d) => (
              <Picker.Item
                key={d.id}
                label={d.name}
                value={d.name}
              />
            ))}
          </Picker>
        </View>

        {/* Range */}
        <Text style={styles.label}>Range Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter range name"
          onChangeText={(v) => setForm({ ...form, range_name: v })}
        />

        {/* Beat */}
        <Text style={styles.label}>Beat Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter beat name"
          onChangeText={(v) => setForm({ ...form, beat_name: v })}
        />

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write announcement details..."
          multiline
          onChangeText={(v) => setForm({ ...form, description: v })}
        />

        {/* Photo */}
        <Text style={styles.label}>Photo</Text>
        <TouchableOpacity style={styles.photoButton} onPress={capturePhoto}>
          <Text style={styles.photoButtonText}>
            {image ? 'Retake Photo' : 'Capture Photo'}
          </Text>
        </TouchableOpacity>

        {image && (
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            disabled={submitting}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={submit}
            disabled={submitting}
          >
            <Text style={styles.submitText}>
              {submitting ? 'Submitting...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default CreateAnnouncementModal;

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f6f7f9'
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 12
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  photoButton: {
    backgroundColor: '#e8f5e9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  photoButtonText: {
    color: '#2e7d32',
    fontWeight: '600'
  },
  imagePreview: {
    height: 200,
    borderRadius: 8,
    marginTop: 12
  },
  actions: {
    flexDirection: 'row',
    marginTop: 24
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#eee',
    marginRight: 8
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    marginLeft: 8
  },
  cancelText: {
    color: '#555',
    fontWeight: '600'
  },
  submitText: {
    color: '#fff',
    fontWeight: '600'
  }
});
