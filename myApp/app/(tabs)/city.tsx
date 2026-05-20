import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MetricDialCard } from '@/components/city/metric-dial-card';
import { ThemedText } from '@/components/themed-text';
import {
  PARENT_INSIGHTS,
  QUIET_ZONES,
  SENSORY_LAYER_LEGEND,
  SENSORY_METRICS,
  SENSORY_SUMMARY,
} from '@/lib/neurosafe-data';

const palette = {
  screen: '#F3F4F8',
  card: '#FFFFFF',
  text: '#111111',
  muted: '#8E99AB',
  border: 'rgba(16, 22, 40, 0.08)',
};

export default function CityScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Сенсорный профиль</ThemedText>
          <ThemedText style={styles.subtitle}>
            Инклюзивная аналитика по шуму, триггерам и безопасным точкам.
          </ThemedText>
        </View>

        <View style={styles.metricsGrid}>
          {SENSORY_METRICS.map((metric) => (
            <MetricDialCard
              key={metric.id}
              value={metric.value}
              unit={metric.unit}
              title={metric.title}
              status={metric.status}
              progress={metric.progress}
              color={metric.color}
            />
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Карта сенсорных слоёв</ThemedText>
          <View style={styles.legendWrap}>
            {SENSORY_LAYER_LEGEND.map((item) => (
              <View key={item.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <ThemedText style={styles.legendLabel}>{item.label}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.summaryRow}>
          {SENSORY_SUMMARY.map((item) => (
            <View key={item.id} style={styles.summaryCard}>
              <ThemedText style={[styles.summaryValue, { color: item.color }]}>{item.value}</ThemedText>
              <ThemedText style={styles.summaryLabel}>{item.label}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Родительская панель</ThemedText>
          <View style={styles.insightGrid}>
            {PARENT_INSIGHTS.map((item) => (
              <View key={item.id} style={styles.insightCard}>
                <ThemedText style={[styles.insightValue, { color: item.accent }]}>{item.value}</ThemedText>
                <ThemedText style={styles.insightLabel}>{item.label}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Тихие места рядом</ThemedText>
          <View style={styles.zoneList}>
            {QUIET_ZONES.map((zone) => (
              <View key={zone.id} style={styles.zoneCard}>
                <View style={styles.zoneHeader}>
                  <View>
                    <ThemedText style={styles.zoneTitle}>{zone.name}</ThemedText>
                    <ThemedText style={styles.zoneMeta}>
                      {zone.type} · {zone.address}
                    </ThemedText>
                  </View>
                  <View style={styles.zoneBadge}>
                    <Ionicons name="leaf-outline" size={14} color="#16A34A" />
                    <ThemedText style={styles.zoneBadgeText}>{zone.noiseLevel}</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.zoneRating}>Рейтинг безопасности: {zone.safetyRating}</ThemedText>
                <View style={styles.featureRow}>
                  {zone.features.map((feature) => (
                    <View key={feature} style={styles.featureChip}>
                      <ThemedText style={styles.featureText}>{feature}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.updateRow}>
          <Ionicons name="time-outline" size={14} color="#8E99AB" />
          <ThemedText style={styles.updateText}>Обновлено сегодня в 11:04</ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.screen,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  header: {
    paddingTop: 18,
    paddingBottom: 18,
  },
  title: {
    color: palette.text,
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  section: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: 16,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  legendWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    color: palette.text,
    fontSize: 13,
    lineHeight: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: palette.border,
  },
  summaryValue: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
  },
  summaryLabel: {
    marginTop: 6,
    color: palette.muted,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
  },
  insightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  insightCard: {
    width: '48%',
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: palette.border,
  },
  insightValue: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
  },
  insightLabel: {
    marginTop: 8,
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  zoneList: {
    gap: 12,
    marginTop: 14,
  },
  zoneCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  zoneTitle: {
    color: palette.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  zoneMeta: {
    marginTop: 4,
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  zoneBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  zoneBadgeText: {
    color: '#166534',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  zoneRating: {
    marginTop: 12,
    color: palette.text,
    fontSize: 13,
    lineHeight: 17,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  featureChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F4F6FB',
  },
  featureText: {
    color: palette.text,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
  },
  updateRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  updateText: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
