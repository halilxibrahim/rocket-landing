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
import { Linking } from 'react-native';

export default function RocketApp() {
  const rocketSize = 100;
  const screenHeight = Dimensions.get('window').height;
  const launchHeight = screenHeight / 100; 
  const startY = -rocketSize; 
  const rocketY = useSharedValue(startY); 
  const thrustOpacity = useSharedValue(0); 
  const [isLaunched, setIsLaunched] = useState(false); 
  const [isGameOver, setIsGameOver] = useState(false); 

  useEffect(() => {
    if (isLaunched) {
      launchRocket(); 
    }
  }, [isLaunched]);

  const launchRocket = () => {
    rocketY.value = withTiming(screenHeight - rocketSize, {
      duration: 12000, 
      easing: Easing.out(Easing.exp),
    });
  };

  useAnimatedReaction(
    () => rocketY.value,
    (value) => {
      if (value >= screenHeight - 450 - rocketSize && !isGameOver) {
        runOnJS(setIsGameOver)(true); 
      }
    }
  );

  const handlePressIn = () => {
    thrustOpacity.value = withTiming(1, { duration: 200 });
    rocketY.value = withSpring(launchHeight, { damping: 8, stiffness: 80 });
  };

  const handlePressOut = () => {
    thrustOpacity.value = withTiming(0, { duration: 500 });
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
          <Text className="text-2xl mb-10 font-bold text-white">
            Rocket Landing Game
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 m-2 rounded-full"
            onPress={() => setIsLaunched(true)}
          >
            <Text className="text-white font-bold">Launch Game</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl text-center mt-10 mx-10">
            In this game, you control a rocket that launches into the air. Press and hold the screen to give the rocket thrust and keep it in the air. Release to let it fall back down. Your goal is to land the rocket safely on the ramp without crashing. If the rocket hits the ramp too hard, the game is over. Try to launch it with the perfect timing for a successful landing!
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.linkedin.com/in/halilxibrahim/')}>
            <Text className="text-white text-center mt-14">
              Developed by Halil İbrahim Kamacı
            </Text>
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

          <View style={{
            position: 'absolute',
            bottom: 80,
            width: '100%',
            height: 5,
            backgroundColor: 'white',
          }} />

          <TouchableOpacity
            className="absolute bottom-10 bg-green-500 px-6 py-3 rounded-full"
            onPress={resetGame}
          >
            <Text className="text-white font-bold">Reset Game</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={isGameOver}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 items-center justify-center bg-black bg-opacity-75">
          <View className="bg-white p-5 rounded-lg">
            <Text className="text-xl font-bold text-center">Rocket Crashed!</Text>
            <Text className="text-center">You lost the game. Play again!</Text>
            <TouchableOpacity
              className="bg-blue-500 px-6 py-3 rounded-full mt-4"
              onPress={resetGame}
            >
              <Text className="text-white ml-10 font-bold">Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
