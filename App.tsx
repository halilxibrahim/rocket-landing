import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Pressable, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing, 
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import { LucideRocket } from 'lucide-react-native';
import './global.css';

export default function RocketApp() {
  const rocketSize = 100;
  const screenHeight = Dimensions.get('window').height;
  const launchHeight = screenHeight / 100; // Roketin havada kalacağı yükseklik
  const startY = -rocketSize; // Roketin başlangıçta üstte yer alması
  const rocketY = useSharedValue(startY); // Roket başlangıçta yukarıda
  const thrustOpacity = useSharedValue(0); // Gaz efekti için şeffaflık
  const [isLaunched, setIsLaunched] = useState(false); // Roket kalktı mı durumu
  const [isGameOver, setIsGameOver] = useState(false); // Oyun durumu

  useEffect(() => {
    if (isLaunched) {
      launchRocket(); // Roketin düşüş animasyonunu başlat
    }
  }, [isLaunched]);

  const launchRocket = () => {
    // Yavaşça düşme animasyonu
    rocketY.value = withTiming(screenHeight - rocketSize, {
      duration: 12000, // Düşme süresi
      easing: Easing.out(Easing.exp),
    });
  };

  useAnimatedReaction(
    () => rocketY.value,
    (value) => {
      // Roketin rampaya çarptığını kontrol et
      if (value >= screenHeight - 340 - rocketSize && !isGameOver) { // 70 rampanın yüksekliği
        runOnJS(setIsGameOver)(true); // Oyun sona erdi
      }

    }
  );

  const handlePressIn = () => {
    thrustOpacity.value = withTiming(1, { duration: 200 });
    rocketY.value = withSpring(launchHeight, { damping: 8, stiffness: 80 });
  };

  const handlePressOut = () => {
    thrustOpacity.value = withTiming(0, { duration: 500 });
    // Düşerken roketin altına daha hızlı geri dönmesini sağlayan animasyon
    rocketY.value = withTiming(screenHeight - rocketSize, { duration: 4000 });
  };

  const animatedRocketStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: rocketY.value }],
  }));

  const animatedThrustStyle = useAnimatedStyle(() => ({
    opacity: thrustOpacity.value,
    transform: [{ scaleY: 1 + thrustOpacity.value }],
  }));

  const resetGame = () => {
    setIsLaunched(false);
    setIsGameOver(false);
    rocketY.value = withTiming(startY, { duration: 0 });
  };

  return (
    <View className="flex-1 bg-gray-800 items-center justify-center">
      <StatusBar style="auto" />

      {!isLaunched ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold text-white">
            Rocket Animation
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 m-2 rounded-full"
            onPress={() => setIsLaunched(true)} // Roketi başlat
          >
            <Text className="text-white font-bold">Launch Rocket</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1 bg-gray-900 items-center justify-center">
          <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View
              style={[
                animatedRocketStyle,
                { position: 'absolute', bottom: 0, right: 0, left: 0, alignItems: 'center' },
              ]}
            >
              <LucideRocket size={rocketSize} color="white" />
              <Animated.View
                style={[
                  animatedThrustStyle,
                  {
                    position: 'absolute',
                    bottom: -20,
                    height: 20,
                    width: 20,
                    backgroundColor: 'rgba(255, 165, 0, 0.6)',
                    borderRadius: 10,
                  },
                ]}
              />
            </Animated.View>
          </Pressable>

          {/* Landing Ramp Line */}
          <View style={{
            position: 'absolute',
            bottom: 70, // Adjust height as needed
            width: '100%',
            height: 5,
            backgroundColor: 'white',
          }} />

          <TouchableOpacity
            className="absolute bottom-10 bg-green-500 px-6 py-3 rounded-full"
            onPress={resetGame} // Yeniden başlat
          >
            <Text className="text-white font-bold">Reset Rocket</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Oyun Bitti Modal */}
      <Modal
        visible={isGameOver}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 items-center justify-center bg-black bg-opacity-75">
          <View className="bg-white p-5 rounded-lg">
            <Text className="text-xl font-bold text-center">Roket Düştü!</Text>
            <Text className="text-center">Oyunu kaybettin. Yeniden oyna!</Text>
            <TouchableOpacity
              className="bg-blue-500 px-6 py-3 rounded-full mt-4"
              onPress={resetGame}
            >
              <Text className="text-white ml-10 font-bold">Yeniden Oyna</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}