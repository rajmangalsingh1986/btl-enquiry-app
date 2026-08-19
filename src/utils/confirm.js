import { Alert, Platform } from 'react-native';

// Alert.alert is a no-op on react-native-web, so a confirm dialog built on it
// silently does nothing when tapped there. window.confirm is the web
// equivalent; Alert.alert still gives the nicer native styling on iOS/Android.
export function confirmAction(title, message, onConfirm) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}

// Same no-op problem as above, but for plain single-button info/error alerts.
export function notify(title, message) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
