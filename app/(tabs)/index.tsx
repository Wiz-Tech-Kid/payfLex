import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  'Loan approval in under 2 minutes',
  'Pay anywhere – online or offline',
  'Zero paperwork, all digital',
  'Flexible repayment options'
];

const PAYMENT_METHODS = [
  { name: 'card', label: 'Card' },
  { name: 'phone-portrait', label: 'Mobile' },
  { name: 'qr-code', label: 'QR Pay' },
  { name: 'globe', label: 'USSD' }
];

export default function Index() {
  const router = useRouter();

  // Animation refs
  const rotate1 = useRef(new Animated.Value(0)).current;
  const rotate2 = useRef(new Animated.Value(0)).current;

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(40)).current;
  const heroScale = useRef(new Animated.Value(0.8)).current;

  const featuresFade = useRef(new Animated.Value(0)).current;
  const featuresSlide = useRef(new Animated.Value(40)).current;

  const paymentFade = useRef(new Animated.Value(0)).current;
  const paymentSlide = useRef(new Animated.Value(40)).current;

  const ctaFade = useRef(new Animated.Value(0)).current;
  const ctaSlide = useRef(new Animated.Value(40)).current;

  // Floating bubbles
  const bubbleAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const bubbles = Array.from({ length: 10 }).map((_, i) => {
    const size = Math.random() * 40 + 24;
    const left = Math.random() * (width - size);
    const duration = Math.random() * 4000 + 6000;
    const delay = Math.random() * 3000;
    const anim = bubbleAnims[i];
    return { size, left, duration, delay, anim };
  });

  useEffect(() => {
    // Infinite rotate for background circles
    Animated.loop(
      Animated.timing(rotate1, {
        toValue: 1,
        duration: 32000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
    Animated.loop(
      Animated.timing(rotate2, {
        toValue: 1,
        duration: 42000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();

    // Staggered entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroFade, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(heroSlide, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.spring(heroScale, { toValue: 1, friction: 5, useNativeDriver: true })
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(featuresFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(featuresSlide, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(paymentFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(paymentSlide, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(ctaFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(ctaSlide, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ])
    ]).start();

    // Floating bubbles animation
    bubbles.forEach(({ anim, duration, delay }) => {
      const loopBubble = () => {
        anim.setValue(0);
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration,
            easing: Easing.linear,
            useNativeDriver: true
          })
        ]).start(loopBubble);
      };
      loopBubble();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Interpolations for rotation
  const rotate1Deg = rotate1.interpolate({ inputRange: [0, 4], outputRange: ['0deg', '360deg'] });
  const rotate2Deg = rotate2.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={StyleSheet.absoluteFill}
      />
      {/* Rotating background circles */}
      <Animated.View
        style={[
          styles.bgCircle,
          styles.bgCircle1,
          { transform: [{ rotate: rotate1Deg }] }
        ]}
      />
      <Animated.View
        style={[
          styles.bgCircle,
          styles.bgCircle2,
          { transform: [{ rotate: rotate2Deg }] }
        ]}
      />
      {/* Floating bubbles */}
      {bubbles.map(({ size, left, anim }, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bubble,
            {
              width: size,
              height: size,
              left,
              bottom: -size,
              opacity: 0.18 + (size / 80) * 0.2,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -height * 0.9]
                  })
                }
              ]
            }
          ]}
        />
      ))}
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { flexGrow: 1, justifyContent: 'center', paddingBottom: 32 }]}
        showsVerticalScrollIndicator={false}
        bounces
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Hero Card */}
          <Animated.View
            style={[
              styles.heroCard,
              {
                opacity: heroFade,
                transform: [
                  { translateY: heroSlide },
                  { scale: heroScale }
                ]
              }
            ]}
          >
            <View style={styles.heroIconWrap}>
              <Ionicons name="globe" size={60} color="#fde047" />
              <View style={styles.heroIconGlow} />
            </View>
            <Text style={styles.heroHeadline}>
              Financial Freedom Across Africa
            </Text>
          </Animated.View>

          {/* Title & Subtitle */}
          <Animated.View
            style={[
              {
                opacity: heroFade,
                transform: [{ translateY: heroSlide }]
              }
            ]}
          >
            <Text style={styles.brandTitle}>PayFlex</Text>
            <Text style={styles.subtitle}>
              Instant loans in minutes. Designed for the African mobile experience.
            </Text>
          </Animated.View>

          {/* Features */}
          <Animated.View
            style={[
              styles.featuresList,
              {
                opacity: featuresFade,
                transform: [{ translateY: featuresSlide }]
              }
            ]}
          >
            {FEATURES.map((text, i) => (
              <Animated.View
                key={text}
                style={[
                  styles.featurePill,
                  {
                    // staggered slide in from left/right
                    transform: [
                      {
                        translateX: featuresSlide.interpolate({
                          inputRange: [0, 40],
                          outputRange: [0, (i % 2 === 0 ? -1 : 1) * 48]
                        })
                      }
                    ]
                  }
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color="#4ade80"
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.featureText}>{text}</Text>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Payment Methods */}
          <Animated.View
            style={[
              styles.paymentCard,
              {
                opacity: paymentFade,
                transform: [{ translateY: paymentSlide }]
              }
            ]}
          >
            <Text style={styles.paymentTitle}>Pay your way:</Text>
            <View style={styles.paymentGrid}>
              {PAYMENT_METHODS.map(({ name, label }) => (
                <View key={name} style={styles.paymentMethod}>
                  <View style={styles.paymentIconWrap}>
                    <Ionicons name={name as any} size={26} color="#c084fc" />
                  </View>
                  <Text style={styles.paymentLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* CTA Button */}
          <Animated.View
            style={[
              styles.ctaWrap,
              {
                opacity: ctaFade,
                transform: [{ translateY: ctaSlide }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.ctaButton}
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/screens/Login')}
            >
              <LinearGradient
                colors={['#f59e0b', '#fbbf24']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Get Instant Access →</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.ctaSubtext}>
              256-bit encryption • Zero fees
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-start',
    paddingVertical: 32,
    minHeight: height,
  },
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    // Remove fixed flex: 1 so content can scroll
  },

  // Rotating background circles
  bgCircle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.13,
    zIndex: 0
  },
  bgCircle1: {
    width: width * 2.2,
    height: width * 2.2,
    top: -width * 1.1,
    left: -width * 0.6,
    backgroundColor: '#c084fc'
  },
  bgCircle2: {
    width: width * 1.7,
    height: width * 1.7,
    bottom: -width * 0.85,
    right: -width * 0.4,
    backgroundColor: '#334155'
  },

  // Floating bubbles
  bubble: {
    position: 'absolute',
    backgroundColor: '#a5b4fc',
    borderRadius: 100,
    zIndex: 1
  },

  // Hero Card
  heroCard: {
    width: Math.min(width * 0.88, 400),
    minHeight: 170,
    backgroundColor: 'rgba(30,41,59,0.82)',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    paddingVertical: 32,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 2
  },
  heroIconWrap: {
    position: 'relative',
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroIconGlow: {
    position: 'absolute',
    top: -18,
    left: -18,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(253,224,71,0.13)',
    zIndex: -1
  },
  heroHeadline: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2
  },

  // Title & Subtitle
  brandTitle: {
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 8,
    letterSpacing: 2,
    color: '#fbbf24',
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-black',
    textShadowColor: '#c084fc',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    fontWeight: '500'
  },

  // Features List
  featuresList: {
    width: '100%',
    marginBottom: 28,
    alignItems: 'center',
    zIndex: 2
  },
  featurePill: {
    minWidth: 220,
    maxWidth: 400,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 22,
    marginBottom: 16,
    backgroundColor: 'rgba(71,85,105,0.32)',
    flexDirection: 'row',
    alignItems: 'center'
  },
  featureText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'left'
  },

  // Payment Methods
  paymentCard: {
    width: Math.min(width * 0.92, 420),
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 10,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 2
  },
  paymentTitle: {
    color: '#a5b4fc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.5
  },
  paymentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 2
  },
  paymentMethod: {
    alignItems: 'center',
    flex: 1
  },
  paymentIconWrap: {
    backgroundColor: 'rgba(124,58,237,0.13)',
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7
  },
  paymentLabel: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center'
  },

  // CTA
  ctaWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
    zIndex: 2
  },
  ctaButton: {
    width: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 10
  },
  ctaGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  ctaText: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  ctaSubtext: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2
  }
});
