import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { compressImageForUpload } from '../../utils/imageUtils';

export default function CreateListingScreen({ onCancel }) {
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const pickImages = async () => {
    // Ask for permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'You need to allow access to your photos to upload properties.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1, // Start with highest quality, we compress later
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      Alert.alert('No images', 'Please select at least one image.');
      return;
    }

    setIsUploading(true);

    try {
      for (const img of images) {
        // 1. Sequentially compress each image locally
        console.log('Original URI:', img.uri);
        const compressedUri = await compressImageForUpload(img.uri);
        console.log('Compressed URI:', compressedUri);

        // 2. Request Presigned PUT URL from Node.js API
        // In a real app, you would point this to your actual API URL and pass the auth token
        /*
        const response = await fetch('http://YOUR_API_URL/api/storage/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ...' },
          body: JSON.stringify({
            fileName: img.fileName || 'photo.jpg',
            fileType: 'image/jpeg',
            bucketType: 'PUBLIC_PROPERTY'
          })
        });
        
        const { uploadUrl, publicUrl } = await response.json();

        // 3. Initiate the upload directly to S3
        const fileResponse = await fetch(compressedUri);
        const blob = await fileResponse.blob();
        
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'image/jpeg' },
          body: blob
        });
        
        console.log('Uploaded successfully to:', publicUrl);
        */
      }

      Alert.alert('Success', 'Property images processed (and simulated upload)!');
      onCancel(); // Go back
    } catch (error) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create New Listing</Text>
      
      <Button title="Select Photos" onPress={pickImages} disabled={isUploading} />
      
      <View style={styles.imageGrid}>
        {images.map((img, index) => (
          <Image key={index} source={{ uri: img.uri }} style={styles.thumbnail} />
        ))}
      </View>

      {isUploading ? (
        <ActivityIndicator size="large" color="#2b5cff" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.buttonRow}>
          <Button title="Upload & Save" onPress={handleUpload} />
          <View style={{ width: 10 }} />
          <Button title="Cancel" color="red" onPress={onCancel} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, justifyContent: 'center' },
  thumbnail: { width: 100, height: 100, margin: 5, borderRadius: 8 },
  buttonRow: { flexDirection: 'row', marginTop: 30 }
});
