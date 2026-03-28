import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  large?: boolean;
}

export const Card = ({ children, style, large }: CardProps) => (
  <View
    style={[
      {
        backgroundColor: colors.card,
        borderRadius: large ? 24 : 16,
        padding: large ? 20 : 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      },
      style,
    ]}
  >
    {children}
  </View>
);

interface BadgeProps {
  label: string;
  type?: 'green' | 'orange' | 'purple' | 'blue' | 'red';
}

export const Badge = ({ label, type = 'green' }: BadgeProps) => {
  const badgeColors = {
    green: { bg: '#d1fae5', text: '#059669' },
    orange: { bg: '#fed7aa', text: '#d97706' },
    purple: { bg: '#e9d5ff', text: '#7c3aed' },
    blue: { bg: '#dbeafe', text: '#0284c7' },
    red: { bg: '#fee2e2', text: '#dc2626' },
  };

  const colors_scheme = badgeColors[type];

  return (
    <View
      style={{
        backgroundColor: colors_scheme.bg,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ color: colors_scheme.text, fontSize: 12, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
};

interface ProgressRingProps {
  percent: number;
  size?: number;
}

export const ProgressRing = ({ percent, size = 80 }: ProgressRingProps) => {
  const circumference = size * Math.PI;
  const progressWidth = (percent / 100) * size * 2;

  return (
    <View style={{ width: size + 20, height: size + 20, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.border,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: size - 12,
            height: size - 12,
            borderRadius: (size - 12) / 2,
            backgroundColor: colors.card,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: colors.foreground,
            }}
          >
            {percent}%
          </Text>
        </View>
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderLeftColor: colors.primary,
            borderLeftWidth: 6,
            borderTopColor: colors.primary,
            borderTopWidth: 6,
            borderRightColor: colors.border,
            borderRightWidth: 6,
            borderBottomColor: colors.border,
            borderBottomWidth: 6,
            transform: [{ rotate: `${(percent / 100) * 360}deg` }],
          }}
        />
      </View>
    </View>
  );
};
