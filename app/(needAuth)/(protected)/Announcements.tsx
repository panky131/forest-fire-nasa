import CreateAnnouncementModal from '@/components/designs/announcements/CreateAnnouncementModal';
import URLs from '@/utils/URLs';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet
} from 'react-native';


const API_BASE = URLs.api_base_url + "announcements";

export interface Announcement {
  announcement_id: number;
  division: string;
  range_name: string;
  beat_name: string;
  description: string;
  image_path: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

const AnnouncementsScreen: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const loadAnnouncements = async (): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/list.php?randomToken=${Math.random() * 10000}`);
      const json = await res.json();
      console.log(json);

      if (json.status === 'success') {
        setAnnouncements(json.announcements);
      }
    } catch (err) {
      console.error('Failed to load announcements', err);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const renderItem = ({ item }: { item: Announcement; }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: `${API_BASE}/${item.image_path}` }}
        style={styles.image}
      />
      <Text style={styles.division}>{item.division}</Text>
      <Text>{item.range_name} / {item.beat_name}</Text>
      <Text style={styles.desc}>{item.description}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.announcement_id.toString()}
        renderItem={renderItem}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      <CreateAnnouncementModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          loadAnnouncements();
        }}
      />
    </View>
  );
};

export default AnnouncementsScreen;

const styles = StyleSheet.create({
  card: {
    padding: 12,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 8
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8
  },
  division: {
    fontWeight: 'bold',
    marginTop: 6
  },
  desc: {
    marginTop: 4
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#2e7d32',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fabText: {
    color: '#fff',
    fontSize: 28
  }
});
