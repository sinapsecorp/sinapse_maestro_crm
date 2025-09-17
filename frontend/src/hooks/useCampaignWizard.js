import { create } from 'zustand'

export const useCampaignWizard = create((set, get) => ({
  form: {
    title: '',
    subject: '',
    body: '',
    channel_ids: [],
    area_ids: [],
    objective: null,
    templates: [], // [{channel_id, subject, content}]
    marketing_account_id: null,
  },
  channels: [], // [{id, name}]
  currentIndex: 0,
  mode: 'create', // 'create' | 'edit'
  campaignId: null,

  setForm: (partial) => set((state) => ({ form: { ...state.form, ...partial } })),
  setChannels: (channels) => set({ channels }),
  setCurrentIndex: (idx) => set({ currentIndex: idx }),
  setChannelTemplate: (channelId, partial) =>
    set((state) => {
      const list = [...(state.form.templates || [])].filter((t) => t.channel_id !== channelId)
      const existing = (state.form.templates || []).find((t) => t.channel_id === channelId) || { channel_id: channelId, subject: state.form.subject, content: '', attachments: [] }
      return { form: { ...state.form, templates: [...list, { ...existing, ...partial, channel_id: channelId }] } }
    }),
  setMode: (mode) => set({ mode }),
  setCampaignId: (id) => set({ campaignId: id }),
  loadFromCampaign: (c) => set({
    form: {
      title: c?.title || c?.name || '',
      subject: c?.subject || '',
      body: c?.body || '',
      channel_ids: (c?.channels || []).map((ch) => ch.id),
      area_ids: (c?.areas || []).map((a) => a.id),
      objective: c?.objective || null,
      templates: (c?.templates || []).map((t) => ({
        channel_id: t.channel_id || null,
        subject: t.subject || c?.subject || '',
        content: t.content || '',
      })),
      marketing_account_id: c?.marketing_account_id || null,
    },
    channels: c?.channels || [],
  }),
  reset: () => set({
    form: { title: '', subject: '', body: '', channel_ids: [], area_ids: [], objective: null, templates: [], marketing_account_id: null },
    channels: [],
    currentIndex: 0,
    mode: 'create',
    campaignId: null,
  }),
}))


