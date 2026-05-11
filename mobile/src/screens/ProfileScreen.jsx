import { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Image,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import { auth } from '../lib/firebase';
import { saveEmployee } from '../lib/firestore';
import { clearPushTokenForUser } from '../hooks/usePushRegistration';
import { clearCurrentTenant } from '../lib/currentTenant';
import useCurrentEmployee from '../hooks/useCurrentEmployee';
import useMyTenants from '../hooks/useMyTenants';

export default function ProfileScreen({ navigation }) {
  const user = auth.currentUser;
  const { employee, loading: empLoading } = useCurrentEmployee();
  const { tenants, current: currentTenant, switchTo, loading: tenantsLoading } = useMyTenants();
  const [draft,   setDraft]   = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    if (employee) setDraft(employee);
  }, [employee?.id]);

  // Header right: Edit ↔ Save (only show if there's an employee record).
  useLayoutEffect(() => {
    if (!employee) {
      navigation.setOptions({ headerRight: undefined });
      return;
    }
    navigation.setOptions({
      headerRight: () => (
        editing
          ? <TouchableOpacity onPress={handleSave} disabled={saving} style={{ marginRight: 12 }}>
              <Text style={[styles.headerBtn, saving && { opacity: 0.5 }]}>
                {saving ? 'Saving…' : 'Save'}
              </Text>
            </TouchableOpacity>
          : <TouchableOpacity onPress={() => setEditing(true)} style={{ marginRight: 12 }}>
              <Text style={styles.headerBtn}>Edit</Text>
            </TouchableOpacity>
      ),
    });
  }, [navigation, editing, saving, draft, employee]);

  const handleSave = useCallback(async () => {
    if (!draft || saving) return;
    setSaving(true);
    try {
      // Editable-by-self fields only — comp data lives in
      // employees/{id}/private/comp and is admin-only.
      const payload = {
        name:      draft.name      || '',
        email:     draft.email     || '',
        phone:     draft.phone     || '',
        instagram: draft.instagram || '',
        facebook:  draft.facebook  || '',
        tiktok:    draft.tiktok    || '',
        venmo:     draft.venmo     || '',
        homepage:  draft.homepage  || '',
      };
      await saveEmployee(employee.id, payload);
      setEditing(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (e) {
      // Saves will fail today because rules require admin to write
      // the parent employee doc; surface the rejection so the user
      // knows they need an admin to update for them.
      Alert.alert(
        'Couldn\'t save',
        e?.code === 'permission-denied'
          ? 'Self-edit isn\'t enabled yet — ask your salon admin to update this for you.'
          : (e?.message || 'Try again later.'),
      );
    } finally {
      setSaving(false);
    }
  }, [draft, saving, employee?.id]);

  async function handleSignOut() {
    try { await clearPushTokenForUser(user?.uid); } catch {}
    try { await clearCurrentTenant(); } catch {}
    await auth.signOut();
  }

  const displayName = employee?.name || user?.displayName || user?.email || '';
  const photo       = employee?.photo || user?.photoURL || null;

  if (empLoading) {
    return <ActivityIndicator style={{ marginTop: 60 }} color="#3D95CE" />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={88}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Identity card */}
        <View style={styles.identity}>
          {photo
            ? <Image source={{ uri: photo }} style={styles.avatar} />
            : <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>{(displayName[0] || '?').toUpperCase()}</Text>
              </View>
          }
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {!employee && (
            <View style={styles.warningPill}>
              <Text style={styles.warningPillText}>
                No employee record linked to this account
              </Text>
            </View>
          )}
        </View>

        {/* Profile fields — only when employee record exists */}
        {employee && draft && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionLabel}>Contact</Text>
            <Field label="Display name" value={draft.name}  onChange={v => setDraft({ ...draft, name: v })}  editing={editing} />
            <Field label="Email"        value={draft.email} onChange={v => setDraft({ ...draft, email: v })} editing={editing} keyboard="email-address" mail={!editing && draft.email} />
            <Field label="Phone"        value={draft.phone} onChange={v => setDraft({ ...draft, phone: v })} editing={editing} keyboard="phone-pad"     tel={!editing && draft.phone} />

            <Text style={[styles.sectionLabel, { marginTop: 18 }]}>Social</Text>
            <Field label="Instagram" value={draft.instagram} onChange={v => setDraft({ ...draft, instagram: v })} editing={editing} placeholder="@handle" />
            <Field label="Facebook"  value={draft.facebook}  onChange={v => setDraft({ ...draft, facebook: v })}  editing={editing} placeholder="profile.url or @handle" />
            <Field label="TikTok"    value={draft.tiktok}    onChange={v => setDraft({ ...draft, tiktok: v })}    editing={editing} placeholder="@handle" />
            <Field label="Venmo"     value={draft.venmo}     onChange={v => setDraft({ ...draft, venmo: v })}     editing={editing} placeholder="@username" />
            <Field label="Homepage"  value={draft.homepage}  onChange={v => setDraft({ ...draft, homepage: v })}  editing={editing} placeholder="https://" keyboard="url" />
          </View>
        )}

        {/* Salon — visible only when the user has access to ≥1 tenant.
            Single-tenant users still see their current salon name as a
            confirmation. Multi-tenant users get a switcher. */}
        {!tenantsLoading && tenants.length > 0 && (
          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionLabel}>
              {tenants.length > 1 ? `Salon (${tenants.length})` : 'Salon'}
            </Text>
            {tenants.map(t => {
              const isCurrent = t.id === currentTenant;
              return (
                <TouchableOpacity
                  key={t.id}
                  disabled={tenants.length === 1 || isCurrent}
                  onPress={() => switchTo(t.id)}
                  style={[styles.tenantRow, isCurrent && styles.tenantRowActive]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tenantName}>{t.name}</Text>
                    <Text style={styles.tenantMeta}>
                      {t.role === 'admin' ? 'Admin' : 'Staff'}
                      {t.plan ? ` · ${t.plan}` : ''}
                    </Text>
                  </View>
                  {isCurrent && <Text style={styles.tenantCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ marginTop: 18 }}>
          <Text style={styles.sectionLabel}>Settings</Text>
          <View style={styles.cardRow}>
            <Text style={styles.settingsBody}>
              Notification preferences, theme, auto-logout — coming soon.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChange, editing, multiline, keyboard, placeholder, tel, mail }) {
  if (!editing) {
    if (!value) return null;
    return (
      <View style={styles.viewRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {tel ? (
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${value.replace(/[^0-9+]/g, '')}`)}>
            <Text style={[styles.fieldValue, styles.linkText]}>{value}</Text>
          </TouchableOpacity>
        ) : mail ? (
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${value}`)}>
            <Text style={[styles.fieldValue, styles.linkText]}>{value}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.fieldValue}>{value}</Text>
        )}
      </View>
    );
  }
  return (
    <View style={styles.editRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value || ''}
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={keyboard}
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        autoCapitalize={keyboard === 'email-address' || keyboard === 'url' ? 'none' : 'sentences'}
        style={styles.editInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content:   { padding: 16, paddingBottom: 32 },
  headerBtn: { color: '#2D7A5F', fontSize: 15, fontWeight: '600' },

  identity:    { alignItems: 'center', paddingVertical: 22, backgroundColor: '#fff', borderRadius: 14 },
  avatar:      { width: 88, height: 88, borderRadius: 44, marginBottom: 10 },
  avatarFallback: { backgroundColor: '#2D7A5F', alignItems: 'center', justifyContent: 'center' },
  avatarInitial:  { color: '#fff', fontSize: 36, fontWeight: '700' },
  name:        { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  email:       { fontSize: 13, color: '#888', marginTop: 4 },

  warningPill:     { marginTop: 10, paddingVertical: 5, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#fef3c7' },
  warningPillText: { fontSize: 12, color: '#92400e', fontWeight: '600' },

  sectionLabel: { fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: '700', marginBottom: 8, marginLeft: 4 },

  viewRow: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 8 },
  editRow: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, marginBottom: 8 },
  fieldLabel: { fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: '600', marginBottom: 4 },
  fieldValue: { fontSize: 14, color: '#1a1a1a' },
  linkText:   { color: '#3D95CE', textDecorationLine: 'underline' },
  editInput:  { fontSize: 14, color: '#1a1a1a', padding: 0 },

  cardRow:      { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  settingsBody: { fontSize: 13, color: '#888', lineHeight: 19 },

  tenantRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 8 },
  tenantRowActive: { backgroundColor: '#f0faf6', borderWidth: 1, borderColor: '#2D7A5F' },
  tenantName:      { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  tenantMeta:      { fontSize: 12, color: '#888', marginTop: 2 },
  tenantCheck:     { fontSize: 18, color: '#2D7A5F', fontWeight: '700' },

  signOutBtn:  { marginTop: 20, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 22, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  signOutText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
});
