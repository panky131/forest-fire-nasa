import CreateAnnouncementModal from '@/components/designs/announcements/CreateAnnouncementModal';
import { ThemedText } from '@/components/ThemedText';
import { horizontalScale, moderateScale } from '@/utils/Metrics';
import URLs from '@/utils/URLs';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';


const API_BASE = URLs.api_base_url + "announcements";

export interface Announcement {
  announcement_id: number;
  division: string;
  range_name: string;
  beat_name: string;
  description: string;
  image_path: string;
  image_path_2?: string;
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


  const renderItem = ({ item }: { item: Announcement; }) => {
    const images = [
      item.image_path,
      item.image_path_2
    ].filter(Boolean);

    return (
      <View style={styles.card}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ height: 200 }}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item: img }) => (
            <Image
              source={{ uri: `${API_BASE}/${img}` }}
              style={styles.image}
            />
          )}
        />


        <ThemedText style={styles.division}>{item.division}</ThemedText>
        <ThemedText style={{ fontSize: moderateScale(14) }}>{item.range_name} / {item.beat_name}</ThemedText>
        <ThemedText style={styles.desc}>{item.description}</ThemedText>
      </View>
    );
  };

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

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  card: {
    padding: 10,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 8
  },
  image: {
    width: screenWidth - 50,
    borderRadius: 8,
    marginHorizontal: horizontalScale(5)
  },
  division: {
    fontWeight: 'bold',
    marginTop: 6
  },
  desc: {
    fontSize: moderateScale(12)
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
