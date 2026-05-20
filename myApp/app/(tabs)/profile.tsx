import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useAuth } from '@/contexts/auth-context';
import { QUICK_PHRASES } from '@/lib/neurosafe-data';

type ActiveSheet = 'sos' | 'phrases' | 'guardian' | 'settings' | null;

const palette = {
  screen: '#F3F4F8',
  card: '#FFFFFF',
  text: '#111111',
  muted: '#8E99AB',
  border: 'rgba(16, 22, 40, 0.08)',
  primary: '#0EA5E9',
  danger: '#DC2626',
  success: '#16A34A',
};

function ActionRow({
  title,
  subtitle,
  icon,
  tone = palette.text,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.rowCard} onPress={onPress}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIconWrap}>
          <Ionicons name={icon} size={18} color={tone} />
        </View>
        <View style={styles.rowText}>
          <ThemedText style={[styles.rowTitle, { color: tone }]}>{title}</ThemedText>
          <ThemedText style={styles.rowSubtitle}>{subtitle}</ThemedText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#C4CBDA" />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { blindModeEnabled, setBlindModeEnabled } = useAccessibility();
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [language, setLanguage] = useState<'RU' | 'KZ' | 'EN'>('RU');
  const [simpleLanguageEnabled, setSimpleLanguageEnabled] = useState(true);

  const displayName = useMemo(() => {
    if (!user?.email) {
      return 'Гость';
    }

    return user.email.split('@')[0] || 'Пользователь';
  }, [user?.email]);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>SOS и поддержка</ThemedText>
          <ThemedText style={styles.subtitle}>
            Быстрый доступ к помощи, тихому режиму и доверенным контактам.
          </ThemedText>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Ionicons name="shield-checkmark-outline" size={42} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.heroName}>{displayName}</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            {user?.email ?? 'Вход не выполнен. Для детского профиля нужен родительский аккаунт.'}
          </ThemedText>

          <Pressable style={styles.sosButton} onPress={() => setActiveSheet('sos')}>
            <Ionicons name="warning-outline" size={20} color="#FFFFFF" />
            <ThemedText style={styles.sosButtonText}>SOS в одно нажатие</ThemedText>
          </Pressable>

          <View style={styles.statusRow}>
            <View style={styles.statusChip}>
              <Ionicons name="pulse-outline" size={14} color={palette.success} />
              <ThemedText style={styles.statusChipText}>Маршрут под контролем</ThemedText>
            </View>
            <View style={styles.statusChip}>
              <Ionicons name="watch-outline" size={14} color={palette.primary} />
              <ThemedText style={styles.statusChipText}>Часы подключены</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <ThemedText style={styles.sectionLabel}>БЫСТРЫЕ ДЕЙСТВИЯ</ThemedText>
          <View style={styles.groupCard}>
            <ActionRow
              title="Невербальная коммуникация"
              subtitle="Фразы крупным текстом для окружающих"
              icon="chatbox-ellipses-outline"
              onPress={() => setActiveSheet('phrases')}
            />
            <ActionRow
              title="Доверенные контакты"
              subtitle="Родитель, тьютор, школьный сопровождающий"
              icon="people-outline"
              onPress={() => setActiveSheet('guardian')}
            />
            <ActionRow
              title="Настройки доступности"
              subtitle="Простой язык, зрение, управление одной рукой"
              icon="accessibility-outline"
              onPress={() => setActiveSheet('settings')}
            />
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <ThemedText style={styles.sectionLabel}>БЕЗОПАСНОСТЬ</ThemedText>
          <View style={styles.groupCard}>
            <ActionRow
              title="Позвонить родителю"
              subtitle="Первый этап эскалации SOS"
              icon="call-outline"
              tone={palette.primary}
              onPress={() => void Linking.openURL('tel:+77015550101')}
            />
            <ActionRow
              title="Экстренный номер 112"
              subtitle="Если нужна немедленная помощь"
              icon="medical-outline"
              tone={palette.danger}
              onPress={() => void Linking.openURL('tel:112')}
            />
            <ActionRow
              title="Голосовой ассистент"
              subtitle="Короткие подсказки и простые инструкции"
              icon="mic-outline"
              onPress={() => router.push('/(tabs)/routes')}
            />
          </View>
        </View>

        <Pressable
          style={styles.authButton}
          onPress={() => {
            if (user) {
              void signOut();
              return;
            }

            router.push('/(auth)');
          }}>
          <ThemedText style={styles.authButtonText}>{user ? 'Выйти' : 'Войти'}</ThemedText>
        </Pressable>
      </ScrollView>

      <BottomSheet
        visible={activeSheet === 'sos'}
        title="SOS"
        icon="warning-outline"
        onClose={() => setActiveSheet(null)}>
        <View style={styles.sheetContent}>
          <View style={styles.sosPanel}>
            <ThemedText style={styles.sosPanelTitle}>Что произойдёт после нажатия</ThemedText>
            <ThemedText style={styles.sosPanelText}>1. Уйдёт геолокация родителю и доверенным контактам.</ThemedText>
            <ThemedText style={styles.sosPanelText}>2. Откроется экран с крупным текстом для окружающих.</ThemedText>
            <ThemedText style={styles.sosPanelText}>3. При необходимости начнётся звонок и эскалация до 112.</ThemedText>
          </View>
          <Pressable style={styles.primaryAction} onPress={() => void Linking.openURL('tel:+77015550101')}>
            <ThemedText style={styles.primaryActionText}>Отправить сигнал родителю</ThemedText>
          </Pressable>
          <Pressable style={styles.dangerAction} onPress={() => void Linking.openURL('tel:112')}>
            <ThemedText style={styles.dangerActionText}>Позвонить 112</ThemedText>
          </Pressable>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={activeSheet === 'phrases'}
        title="Невербальный режим"
        icon="chatbox-ellipses-outline"
        onClose={() => setActiveSheet(null)}>
        <View style={styles.sheetContent}>
          <View style={styles.phraseGrid}>
            {QUICK_PHRASES.map((item) => (
              <View key={item.id} style={styles.phraseCard}>
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={18} color={palette.primary} />
                <ThemedText style={styles.phraseText}>{item.label}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={activeSheet === 'guardian'}
        title="Доверенные контакты"
        icon="people-outline"
        onClose={() => setActiveSheet(null)}>
        <View style={styles.sheetContent}>
          <View style={styles.contactCard}>
            <ThemedText style={styles.contactTitle}>Мама · Алия</ThemedText>
            <ThemedText style={styles.contactText}>Основной контакт для маршрута, SOS и оповещений.</ThemedText>
          </View>
          <View style={styles.contactCard}>
            <ThemedText style={styles.contactTitle}>Тьютор · Нуржан</ThemedText>
            <ThemedText style={styles.contactText}>Получает уведомление, если маршрут критически нарушен.</ThemedText>
          </View>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={activeSheet === 'settings'}
        title="Доступность"
        icon="accessibility-outline"
        onClose={() => setActiveSheet(null)}>
        <View style={styles.sheetContent}>
          <Pressable style={styles.toggleRow} onPress={() => setSimpleLanguageEnabled((value) => !value)}>
            <View>
              <ThemedText style={styles.toggleTitle}>Простой язык</ThemedText>
              <ThemedText style={styles.toggleSubtitle}>Короткие и спокойные подсказки</ThemedText>
            </View>
            <ThemedText style={styles.toggleValue}>{simpleLanguageEnabled ? 'Вкл' : 'Выкл'}</ThemedText>
          </Pressable>

          <Pressable style={styles.toggleRow} onPress={() => setBlindModeEnabled(!blindModeEnabled)}>
            <View>
              <ThemedText style={styles.toggleTitle}>Режим для слабовидящих</ThemedText>
              <ThemedText style={styles.toggleSubtitle}>Открывает вкладку зрения и голосовую помощь</ThemedText>
            </View>
            <ThemedText style={styles.toggleValue}>{blindModeEnabled ? 'Вкл' : 'Выкл'}</ThemedText>
          </Pressable>

          <Pressable
            style={styles.toggleRow}
            onPress={() =>
              setLanguage((current) => (current === 'RU' ? 'KZ' : current === 'KZ' ? 'EN' : 'RU'))
            }>
            <View>
              <ThemedText style={styles.toggleTitle}>Язык интерфейса</ThemedText>
              <ThemedText style={styles.toggleSubtitle}>RU / KZ / EN для ребёнка и родителя</ThemedText>
            </View>
            <ThemedText style={styles.toggleValue}>{language}</ThemedText>
          </Pressable>
        </View>
      </BottomSheet>
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
    paddingBottom: 12,
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
  heroCard: {
    borderRadius: 26,
    padding: 18,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
  },
  heroName: {
    marginTop: 14,
    color: palette.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    marginTop: 4,
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  sosButton: {
    width: '100%',
    marginTop: 18,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: palette.danger,
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F4F6FB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusChipText: {
    color: palette.text,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  sectionBlock: {
    marginTop: 16,
  },
  sectionLabel: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  groupCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  rowCard: {
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rowIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F4F6FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '700',
  },
  rowSubtitle: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  authButton: {
    marginTop: 20,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#E8F2FF',
  },
  authButtonText: {
    color: palette.primary,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  sheetContent: {
    gap: 14,
  },
  sosPanel: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#FFF3F3',
  },
  sosPanelTitle: {
    color: palette.danger,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  sosPanelText: {
    color: palette.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  primaryAction: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: palette.primary,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  dangerAction: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: palette.danger,
  },
  dangerActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  phraseGrid: {
    gap: 10,
  },
  phraseCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#F4F6FB',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  phraseText: {
    flex: 1,
    color: palette.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  contactCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#F4F6FB',
  },
  contactTitle: {
    color: palette.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  contactText: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  toggleRow: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#F4F6FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleTitle: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  toggleSubtitle: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  toggleValue: {
    color: palette.primary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
});
