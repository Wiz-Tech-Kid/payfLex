import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CompanionChatScreen from '../../app/screens/CompanionChatScreen';

export default function ChatbotFloatingButton() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI Chatbot</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={28} color="#0a7ea4" />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <CompanionChatScreen />
            </View>
          </View>
        </View>
      </Modal>
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => setVisible(true)}
        accessibilityLabel="Need help? Chat with us!"
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
        <View style={styles.tooltipBox}>
          <Text style={styles.tooltipText}>Need help? Chat with us!</Text>
        </View>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    bottom: Platform.OS === 'ios' ? 48 : 24,
    backgroundColor: '#0a7ea4',
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  tooltipBox: {
    position: 'absolute',
    right: 64,
    top: 0,
    backgroundColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    opacity: 0.95,
    zIndex: 101,
    minWidth: 120,
    display: Platform.OS === 'web' ? 'flex' : 'none', // Only show on web hover
  },
  tooltipText: {
    color: '#fff',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 400,
    maxHeight: '90%',
    padding: 0,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
});
