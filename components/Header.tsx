import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type HeaderProps = {
  title: string;
  onBack?: () => void;
};

export const Header = ({ title, onBack }: HeaderProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.headerContainer,
        { backgroundColor: isDark ? '#2C2C3D' : '#FFF7F0' },
      ]}
    >
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backContainer}>
          <Feather
            name="arrow-left"
            size={24}
            color={isDark ? '#FFD6A5' : '#FF6347'}
          />
          <Text style={[styles.headerText, { color: isDark ? '#FFD6A5' : '#FF6347' }]}>
            {title}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={[styles.headerText, { color: isDark ? '#FFD6A5' : '#FF6347' }]}>
          {title}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 70,
    paddingTop: 25,
    paddingHorizontal: 20,
    justifyContent: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: "600",
    fontFamily: "System",
    marginLeft: 8, // khoảng cách giữa icon và chữ
  },
});
