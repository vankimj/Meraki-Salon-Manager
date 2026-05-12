import { useState, useEffect, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
  Modal, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { auth } from '../lib/firebase';
import { subscribeToChats, fetchClients, sendChatMessage, sendSmsToClient, sendEmailToClient } from '../lib/firestore';
import Icon from '../components/Icon';

function fmtRelative(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diffSec = Math.floor((Date.now() - t) / 1000);
  if (diffSec < 60)        return 'just now';
  if (diffSec < 3600)      return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400)     return `${Math.floor(diffSec / 3600)}h`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}d`;
  return new Date(iso).toLocaleDateString();
}

export default function ChatScreen({ navigation }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeToChats((list) => {
      setThreads(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 60 }} color="#3D95CE" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {threads.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="chat" size={56} color="#cbd0d6" strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { marginTop: 14 }]}>No messages yet</Text>
          <Text style={styles.emptyBody}>
            Client conversations show up here. You'll get a push when a client replies.
          </Text>
          <TouchableOpacity style={styles.emptyComposeBtn} onPress={() => setComposeOpen(true)}>
            <Text style={styles.emptyComposeBtnText}>＋ New message</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={styles.container}
          data={threads}
          keyExtractor={t => t.id}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item: t }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ChatThread', {
                clientId: t.clientId || t.id,
                clientName: t.clientName,
                clientEmail: t.clientEmail,
              })}
            >
              <View style={[styles.avatar, t.unreadStaff > 0 && styles.avatarUnread]}>
                <Text style={[styles.avatarInitial, t.unreadStaff > 0 && { color: '#fff' }]}>
                  {(t.clientName || '?')[0].toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.rowTop}>
                  <Text style={[styles.name, t.unreadStaff > 0 && styles.nameUnread]} numberOfLines={1}>
                    {t.clientName || 'Unknown client'}
                  </Text>
                  <Text style={styles.time}>{fmtRelative(t.lastAt)}</Text>
                </View>
                <Text
                  style={[styles.preview, t.unreadStaff > 0 && styles.previewUnread]}
                  numberOfLines={1}
                >
                  {t.lastMessage || 'No messages yet'}
                </Text>
              </View>
              {t.unreadStaff > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{t.unreadStaff > 9 ? '9+' : t.unreadStaff}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating compose button — always visible so the user can start
          a new thread from any state, including when threads exist. */}
      {threads.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => setComposeOpen(true)} activeOpacity={0.8}>
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>
      )}

      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSent={(threadInfo) => {
          setComposeOpen(false);
          if (threadInfo) {
            navigation.navigate('ChatThread', threadInfo);
          }
        }}
      />
    </View>
  );
}

// ── New-message composer ───────────────────────────────
// Pick a client (search by name), pick a channel (App / SMS / Email,
// SMS+Email gated on whether the client has the contact info on file),
// type a message, send. On success, hands the parent the thread route
// params so the user lands in the conversation.
function ComposeModal({ open, onClose, onSent }) {
  const [allClients, setAllClients] = useState(null);
  const [search, setSearch]   = useState('');
  const [picked, setPicked]   = useState(null);
  const [channel, setChannel] = useState('app');
  const [subject, setSubject] = useState('Message from your salon');
  const [text, setText]       = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchClients().then(setAllClients).catch(() => setAllClients([]));
    setSearch('');
    setPicked(null);
    setChannel('app');
    setText('');
    setSubject('Message from your salon');
  }, [open]);

  const filtered = useMemo(() => {
    if (!allClients) return [];
    const q = search.trim().toLowerCase();
    if (!q) return allClients.slice(0, 30);
    return allClients.filter(c => (c.name || '').toLowerCase().includes(q)).slice(0, 30);
  }, [allClients, search]);

  // Auto-fall-back to a channel the picked client supports — picking an
  // SMS-less client and leaving SMS selected would otherwise crash on
  // send. The first available channel wins (App is always available).
  useEffect(() => {
    if (!picked) return;
    if (channel === 'sms' && !picked.phone)   setChannel('app');
    if (channel === 'email' && !picked.email) setChannel('app');
  }, [picked, channel]);

  async function send() {
    if (!picked || !text.trim() || sending) return;
    setSending(true);
    try {
      if (channel === 'sms') {
        await sendSmsToClient(picked.id, text.trim());
      } else if (channel === 'email') {
        await sendEmailToClient(picked.id, subject.trim() || 'Message from your salon', text.trim());
      } else {
        const me = auth.currentUser;
        await sendChatMessage(picked.id, { name: picked.name, email: picked.email }, {
          from: 'staff',
          text: text.trim(),
          at:   new Date().toISOString(),
          sender: me?.displayName || me?.email || 'Staff',
        });
      }
      onSent?.({ clientId: picked.id, clientName: picked.name, clientEmail: picked.email });
    } catch (e) {
      Alert.alert('Couldn\'t send', e?.message || 'Please try again.');
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;
  const canSend = picked && text.trim().length > 0 && !sending;

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={composeStyles.backdrop}>
          <View style={composeStyles.sheet}>
            <View style={composeStyles.header}>
              <Text style={composeStyles.title}>New message</Text>
              <TouchableOpacity onPress={onClose} style={composeStyles.closeBtn}>
                <Text style={composeStyles.closeBtnText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14 }} keyboardShouldPersistTaps="handled">
              {!picked ? (
                <>
                  <Text style={composeStyles.label}>To</Text>
                  <TextInput
                    style={composeStyles.search}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search clients by name…"
                    placeholderTextColor="#bbb"
                    autoFocus
                  />
                  <ScrollView style={composeStyles.clientList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                    {allClients === null && <ActivityIndicator style={{ padding: 16 }} color="#3D95CE" />}
                    {allClients !== null && filtered.length === 0 && (
                      <Text style={composeStyles.empty}>No matches{search ? ` for "${search}"` : ''}</Text>
                    )}
                    {filtered.map(c => (
                      <TouchableOpacity
                        key={c.id}
                        style={composeStyles.clientRow}
                        onPress={() => setPicked(c)}
                      >
                        <Text style={composeStyles.clientName}>{c.name}</Text>
                        <Text style={composeStyles.clientMeta}>
                          {c.phone || ''}{c.phone && c.email ? ' · ' : ''}{c.email || ''}
                          {(!c.phone && !c.email) ? '(no contact info)' : ''}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              ) : (
                <>
                  <View style={composeStyles.toRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={composeStyles.label}>To</Text>
                      <Text style={composeStyles.toName}>{picked.name}</Text>
                      <Text style={composeStyles.toMeta}>
                        {picked.phone || ''}{picked.phone && picked.email ? ' · ' : ''}{picked.email || ''}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setPicked(null)} style={composeStyles.changeBtn}>
                      <Text style={composeStyles.changeBtnText}>Change</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[composeStyles.label, { marginTop: 12 }]}>Channel</Text>
                  <View style={composeStyles.channelRow}>
                    {[
                      { id: 'app',   label: '💬 App',  enabled: true },
                      { id: 'sms',   label: '📱 SMS',  enabled: !!picked.phone },
                      { id: 'email', label: '✉️ Email', enabled: !!picked.email },
                    ].map(c => (
                      <TouchableOpacity
                        key={c.id}
                        disabled={!c.enabled}
                        onPress={() => setChannel(c.id)}
                        style={[
                          composeStyles.channelChip,
                          channel === c.id && c.enabled && composeStyles.channelChipActive,
                          !c.enabled && composeStyles.channelChipDisabled,
                        ]}
                      >
                        <Text style={[
                          composeStyles.channelChipText,
                          channel === c.id && c.enabled && composeStyles.channelChipTextActive,
                          !c.enabled && composeStyles.channelChipTextDisabled,
                        ]}>{c.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {channel === 'email' && (
                    <>
                      <Text style={[composeStyles.label, { marginTop: 12 }]}>Subject</Text>
                      <TextInput
                        style={composeStyles.input}
                        value={subject}
                        onChangeText={setSubject}
                        placeholder="Subject"
                        placeholderTextColor="#bbb"
                        maxLength={200}
                      />
                    </>
                  )}

                  <Text style={[composeStyles.label, { marginTop: 12 }]}>Message</Text>
                  <TextInput
                    style={[composeStyles.input, { minHeight: 120, textAlignVertical: 'top' }]}
                    value={text}
                    onChangeText={setText}
                    placeholder={channel === 'sms' ? 'Send as SMS…' : channel === 'email' ? 'Email body…' : 'Type a message…'}
                    placeholderTextColor="#bbb"
                    multiline
                    maxLength={2000}
                  />

                  <TouchableOpacity
                    style={[composeStyles.sendBtn, !canSend && { opacity: 0.4 }, { marginTop: 16 }]}
                    onPress={send}
                    disabled={!canSend}
                  >
                    <Text style={composeStyles.sendBtnText}>{sending ? 'Sending…' : 'Send message'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  sep:       { height: 1, backgroundColor: '#f0f0f0', marginLeft: 70 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16, gap: 12,
    backgroundColor: '#fff',
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e8f4f0', alignItems: 'center', justifyContent: 'center' },
  avatarUnread: { backgroundColor: '#3D95CE' },
  avatarInitial: { fontSize: 16, fontWeight: '700', color: '#2D7A5F' },
  rowTop:        { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  name:          { fontSize: 14, fontWeight: '600', color: '#1a1a1a', flex: 1 },
  nameUnread:    { fontWeight: '700' },
  time:          { fontSize: 11, color: '#aaa' },
  preview:       { fontSize: 12, color: '#888', marginTop: 3 },
  previewUnread: { color: '#1a1a1a', fontWeight: '500' },
  unreadBadge:   { backgroundColor: '#ef4444', borderRadius: 10, minWidth: 20, paddingHorizontal: 6, paddingVertical: 2, alignItems: 'center' },
  unreadBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  emptyBody:  { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 19 },
  emptyComposeBtn: { marginTop: 22, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 22, backgroundColor: '#2D7A5F' },
  emptyComposeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  fab: { position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2D7A5F', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 6 },
  fabText: { fontSize: 30, color: '#fff', fontWeight: '300', lineHeight: 32 },
});

const composeStyles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,.55)' },
  sheet:    { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '85%', paddingBottom: 20 },
  header:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title:    { flex: 1, fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },
  closeBtnText: { fontSize: 22, color: '#666', lineHeight: 24 },
  label:    { fontSize: 11, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  search:   { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1a1a1a', backgroundColor: '#fafafa' },
  clientList: { marginTop: 8, height: 320, backgroundColor: '#fafafa', borderRadius: 10 },
  clientRow:  { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  clientName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  clientMeta: { fontSize: 11, color: '#888', marginTop: 2 },
  empty:      { padding: 20, textAlign: 'center', color: '#888', fontSize: 12 },
  toRow:      { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#f0faf6', borderRadius: 10, padding: 12 },
  toName:     { fontSize: 15, fontWeight: '700', color: '#1a4d3a' },
  toMeta:     { fontSize: 12, color: '#2d7a5f', marginTop: 2 },
  changeBtn:  { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#bbf7d0' },
  changeBtnText: { fontSize: 11, color: '#2D7A5F', fontWeight: '700' },
  channelRow: { flexDirection: 'row', gap: 6 },
  channelChip:        { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e5e7eb' },
  channelChipActive:  { backgroundColor: '#EBF4FB', borderColor: '#3D95CE' },
  channelChipDisabled:{ opacity: 0.4 },
  channelChipText:        { fontSize: 13, fontWeight: '600', color: '#666' },
  channelChipTextActive:  { color: '#1a5f8a', fontWeight: '700' },
  channelChipTextDisabled:{ color: '#aaa' },
  input:      { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1a1a1a', backgroundColor: '#fff' },
  sendBtn:    { backgroundColor: '#2D7A5F', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  sendBtnText:{ color: '#fff', fontSize: 14, fontWeight: '700' },
});
