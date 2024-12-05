import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF'
  },
  section: {
    margin: 0,
    padding: 0,
    flexGrow: 1
  },
  image: {
    objectFit: 'contain',
    width: '100%'
  }
});

