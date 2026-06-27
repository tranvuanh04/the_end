import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Member, Feedback } from '../types';
import MemberCard from '../components/MemberCard';
import {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  getFeedbacks,
  deleteFeedback
} from '../services/api';
import './AdminPage.css';
import { toDirectAvatarUrl } from '../utils/avatarUrl';

// Preset colors from the design system
const PRESET_COLORS = [
  { name: 'Gold', hex: '#d4a574' },
  { name: 'Rose', hex: '#e8a0bf' },
  { name: 'Blue', hex: '#7eb8da' },
  { name: 'Green', hex: '#a8e6cf' },
  { name: 'Purple', hex: '#c3aed6' },
  { name: 'Peach', hex: '#ffd3b6' },
];

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

// Helper to format relative time
function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Vừa xong';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  return `${months} tháng trước`;
}

export default function AdminPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'members' | 'feedbacks'>('members');

  // Feedbacks State
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState<boolean>(false);
  const [feedbacksError, setFeedbacksError] = useState<string | null>(null);
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState<string>('');
  const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null);
  const [isDeleteFeedbackModalOpen, setIsDeleteFeedbackModalOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });

  // Modal control
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formQuote, setFormQuote] = useState('');
  const [formColor, setFormColor] = useState('#d4a574');
  const [formOrder, setFormOrder] = useState<number>(0);

  // Fetch all members on mount
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await getMembers();
      setMembers(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách thành viên. Vui lòng kiểm tra server.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch feedbacks
  const fetchFeedbacks = async () => {
    try {
      setFeedbacksLoading(true);
      const data = await getFeedbacks();
      setFeedbacks(data);
      setFeedbacksError(null);
    } catch (err) {
      console.error(err);
      setFeedbacksError('Không thể tải danh sách lời nhắn.');
    } finally {
      setFeedbacksLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchFeedbacks();
  }, []);

  // Show Toast helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // Open modal for Adding a new member
  const handleOpenAddModal = () => {
    setSelectedMember(null);
    setFormName('');
    setFormNickname('');
    setFormRole('');
    setFormAvatar('');
    setFormMessage('');
    setFormQuote('');
    setFormColor('#d4a574');
    // Default order should be members.length + 1
    const nextOrder = members.length > 0 ? Math.max(...members.map((m) => m.order)) + 1 : 1;
    setFormOrder(nextOrder);
    setIsFormModalOpen(true);
  };

  // Open modal for Editing a member
  const handleOpenEditModal = (member: Member) => {
    setSelectedMember(member);
    setFormName(member.name);
    setFormNickname(member.nickname || '');
    setFormRole(member.role);
    setFormAvatar(member.avatar || '');
    setFormMessage(member.message);
    setFormQuote(member.quote || '');
    setFormColor(member.color || '#d4a574');
    setFormOrder(member.order || 0);
    setIsFormModalOpen(true);
  };

  // Open modal for Deleting a member
  const handleOpenDeleteModal = (member: Member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  // Handle Form Submit (Add or Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formRole.trim() || !formMessage.trim()) {
      showToast('Vui lòng điền đầy đủ các trường bắt buộc (*)', 'error');
      return;
    }

    // Auto-avatar generator if empty using DiceBear
    let finalAvatar = formAvatar.trim();
    if (!finalAvatar) {
      finalAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(formName.trim())}`;
    }

    const payload = {
      name: formName.trim(),
      nickname: formNickname.trim() || undefined,
      role: formRole.trim(),
      avatar: finalAvatar,
      message: formMessage.trim(),
      quote: formQuote.trim() || undefined,
      color: formColor,
      order: Number(formOrder),
    };

    try {
      if (selectedMember) {
        // Edit Mode
        const updated = await updateMember(selectedMember._id, payload);
        showToast(`Đã cập nhật thông tin của ${updated.name}`);
      } else {
        // Add Mode
        const created = await createMember(payload);
        showToast(`Đã thêm thành viên ${created.name} thành công`);
      }
      setIsFormModalOpen(false);
      fetchMembers();
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi lưu thông tin.', 'error');
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    try {
      await deleteMember(memberToDelete._id);
      showToast(`Đã xóa thành viên ${memberToDelete.name}`);
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
      fetchMembers();
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi xóa thành viên.', 'error');
    }
  };

  // Filter members based on search query
  const filteredMembers = members.filter((member) => {
    const term = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(term) ||
      (member.nickname && member.nickname.toLowerCase().includes(term)) ||
      member.role.toLowerCase().includes(term)
    );
  });

  // Filter feedbacks based on search
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const term = feedbackSearchQuery.toLowerCase();
    return (
      fb.memberName.toLowerCase().includes(term) ||
      fb.content.toLowerCase().includes(term)
    );
  });

  // Handle Delete Feedback
  const handleOpenDeleteFeedbackModal = (fb: Feedback) => {
    setFeedbackToDelete(fb);
    setIsDeleteFeedbackModalOpen(true);
  };

  const handleDeleteFeedbackConfirm = async () => {
    if (!feedbackToDelete) return;
    try {
      await deleteFeedback(feedbackToDelete._id);
      showToast(`Đã xóa lời nhắn của ${feedbackToDelete.memberName}`);
      setIsDeleteFeedbackModalOpen(false);
      setFeedbackToDelete(null);
      fetchFeedbacks();
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi xóa lời nhắn.', 'error');
    }
  };

  // Create temporary mock member object for the Live Preview
  const previewMember: Member = {
    _id: selectedMember?._id || 'preview_id',
    name: formName || 'Họ và Tên',
    nickname: formNickname || 'Biệt danh',
    role: formRole || 'Chức vụ',
    avatar: formAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(formName || 'Preview')}`,
    message: formMessage || 'Lời nhắn tri ân sẽ hiển thị ở đây...',
    quote: formQuote || 'Câu nói tâm đắc...',
    color: formColor,
    order: Number(formOrder),
    createdAt: selectedMember?.createdAt || new Date().toISOString(),
  };

  return (
    <div className="admin-page">
      <div className="admin-bg-gradient" />

      <div className="admin-container">
        {/* Navigation & Header */}
        <header className="admin-header">
          <div className="admin-title-area">
            <h1 className="admin-title">Quản trị Hệ thống</h1>
            <p className="admin-subtitle">Quản lý danh sách những người đồng hành</p>
          </div>
          <div className="admin-actions">
            <Link to="/members" className="btn-secondary">
              ← Xem trang chính
            </Link>
            {activeTab === 'members' && (
              <button className="btn-primary" onClick={handleOpenAddModal}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Thêm thành viên
              </button>
            )}
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Thành viên
            <span className="admin-tab-badge">{members.length}</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'feedbacks' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedbacks')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Lời nhắn
            {feedbacks.length > 0 && (
              <span className="admin-tab-badge admin-tab-badge-highlight">{feedbacks.length}</span>
            )}
          </button>
        </div>

        {/* ===== MEMBERS TAB ===== */}
        {activeTab === 'members' && (
          <>
            {/* Controls Bar */}
            <div className="admin-controls">
              <div className="admin-search-wrapper">
                <svg
                  className="admin-search-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Tìm theo tên, biệt danh, chức vụ..."
                  className="admin-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Tổng số: <strong>{filteredMembers.length}</strong> / {members.length}
              </div>
            </div>

            {/* Data Table */}
            <div className="admin-table-container glass-panel">
              {loading ? (
                <div className="admin-empty-state">
                  <div className="spinner" style={{ margin: '0 auto 15px', borderLeftColor: 'var(--accent-gold)' }} />
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : error ? (
                <div className="admin-empty-state">
                  <p style={{ color: '#ef5350' }}>{error}</p>
                  <button className="btn-secondary" style={{ marginTop: '15px' }} onClick={fetchMembers}>
                    Thử lại
                  </button>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="admin-empty-state">
                  <div className="admin-empty-icon">📂</div>
                  <p>Không tìm thấy thành viên nào khớp với tìm kiếm.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>STT</th>
                      <th>Thành viên</th>
                      <th>Chức vụ</th>
                      <th>Màu sắc</th>
                      <th>Lời nhắn</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr key={member._id} className="admin-row">
                        <td>
                          <span className="admin-order-badge">{member.order}</span>
                        </td>
                        <td>
                          <div className="admin-member-meta">
                            {member.avatar ? (
                              <img
                                src={toDirectAvatarUrl(member.avatar)}
                                alt={member.name}
                                className="admin-member-avatar"
                              />
                            ) : (
                              <div className="admin-member-avatar-placeholder">
                                {member.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="admin-member-name">{member.name}</div>
                              {member.nickname && (
                                <div className="admin-member-nickname">({member.nickname})</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="admin-member-role">{member.role}</span>
                        </td>
                        <td>
                          <div className="admin-member-color-indicator">
                            <span
                              className="admin-color-dot"
                              style={{ backgroundColor: member.color || '#d4a574' }}
                            />
                            {member.color || '#d4a574'}
                          </div>
                        </td>
                        <td>
                          <div className="admin-member-message" title={member.message}>
                            {member.message}
                          </div>
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button
                              className="btn-icon btn-icon-edit"
                              title="Sửa thông tin"
                              onClick={() => handleOpenEditModal(member)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                              </svg>
                            </button>
                            <button
                              className="btn-icon btn-icon-delete"
                              title="Xóa thành viên"
                              onClick={() => handleOpenDeleteModal(member)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ===== FEEDBACKS TAB ===== */}
        {activeTab === 'feedbacks' && (
          <>
            {/* Controls Bar */}
            <div className="admin-controls">
              <div className="admin-search-wrapper">
                <svg
                  className="admin-search-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Tìm theo tên người gửi hoặc nội dung..."
                  className="admin-search-input"
                  value={feedbackSearchQuery}
                  onChange={(e) => setFeedbackSearchQuery(e.target.value)}
                />
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Tổng số: <strong>{filteredFeedbacks.length}</strong> lời nhắn
              </div>
            </div>

            {/* Feedbacks Content */}
            <div className="admin-feedbacks-container">
              {feedbacksLoading ? (
                <div className="admin-empty-state glass-panel">
                  <div className="spinner" style={{ margin: '0 auto 15px', borderLeftColor: 'var(--accent-gold)' }} />
                  <p>Đang tải lời nhắn...</p>
                </div>
              ) : feedbacksError ? (
                <div className="admin-empty-state glass-panel">
                  <p style={{ color: '#ef5350' }}>{feedbacksError}</p>
                  <button className="btn-secondary" style={{ marginTop: '15px' }} onClick={fetchFeedbacks}>
                    Thử lại
                  </button>
                </div>
              ) : filteredFeedbacks.length === 0 ? (
                <div className="admin-empty-state glass-panel">
                  <div className="admin-empty-icon">💬</div>
                  <p>Chưa có lời nhắn nào từ người dùng.</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Khi ai đó để lại lời nhắn trên trang thành viên, nó sẽ hiển thị ở đây.
                  </p>
                </div>
              ) : (
                <div className="admin-feedbacks-grid">
                  {filteredFeedbacks.map((fb, index) => (
                    <motion.div
                      key={fb._id}
                      className="admin-feedback-card glass-panel"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="admin-feedback-card-header">
                        <div className="admin-feedback-sender">
                          {fb.emoji && <span className="admin-feedback-emoji">{fb.emoji}</span>}
                          <div>
                            <div className="admin-feedback-sender-name">{fb.memberName}</div>
                            <div className="admin-feedback-time">{timeAgo(fb.createdAt)}</div>
                          </div>
                        </div>
                        <button
                          className="btn-icon btn-icon-delete"
                          title="Xóa lời nhắn"
                          onClick={() => handleOpenDeleteFeedbackModal(fb)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                      <div className="admin-feedback-content">
                        <p>{fb.content}</p>
                      </div>
                      <div className="admin-feedback-card-footer">
                        <span className="admin-feedback-date">
                          {new Date(fb.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="admin-feedback-for-label">gửi cho thành viên</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* FORM MODAL (ADD & EDIT) */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="admin-modal-overlay">
            <motion.div
              className="admin-modal glass-panel"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            >
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">
                  {selectedMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}
                </h2>
                <button className="admin-modal-close" onClick={() => setIsFormModalOpen(false)}>
                  &times;
                </button>
              </div>

              <div className="admin-modal-content">
                {/* Form fields */}
                <form className="admin-form" onSubmit={handleFormSubmit}>
                  <div className="admin-form-row">
                    <div className="form-group">
                      <label>Họ và Tên *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Biệt danh / Nickname</label>
                      <input
                        type="text"
                        placeholder="Anh A, A bro..."
                        value={formNickname}
                        onChange={(e) => setFormNickname(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="form-group">
                      <label>Chức vụ *</label>
                      <input
                        type="text"
                        required
                        placeholder="Team Lead, Developer..."
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Thứ tự hiển thị (Stt)</label>
                      <input
                        type="number"
                        min="0"
                        value={formOrder}
                        onChange={(e) => setFormOrder(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Link ảnh đại diện (Avatar URL)</label>
                    <input
                      type="text"
                      placeholder="https://api.dicebear.com/... hoặc để trống để tự sinh ảnh"
                      value={formAvatar}
                      onChange={(e) => setFormAvatar(e.target.value)}
                    />
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                      * Bỏ trống hệ thống sẽ tự sinh avatar hoạt hình dựa trên tên thành viên.
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Màu sắc chủ đạo (Accent Color) *</label>
                    <div className="admin-color-picker-group">
                      {PRESET_COLORS.map((preset) => (
                        <button
                          key={preset.hex}
                          type="button"
                          className={`preset-color-btn ${formColor === preset.hex ? 'active' : ''}`}
                          style={{ backgroundColor: preset.hex }}
                          title={preset.name}
                          onClick={() => setFormColor(preset.hex)}
                        />
                      ))}
                      <div className="custom-color-input-wrapper">
                        <input
                          type="color"
                          className="custom-color-picker"
                          value={formColor}
                          onChange={(e) => setFormColor(e.target.value)}
                          title="Tự chọn màu"
                        />
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {formColor}
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Lời tri ân / Cảm nghĩ dành riêng *</label>
                    <textarea
                      required
                      placeholder="Viết những lời cảm ơn chân thành, kỷ niệm sâu sắc..."
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Câu nói ấn tượng (Quote)</label>
                    <input
                      type="text"
                      placeholder='"Đừng sợ sai!" — Anh A'
                      value={formQuote}
                      onChange={(e) => setFormQuote(e.target.value)}
                    />
                  </div>
                </form>

                {/* Live card preview */}
                <div className="admin-modal-preview-section">
                  <h3 className="preview-label">Xem trước Card</h3>
                  <div className="live-preview-box">
                    <MemberCard
                      member={previewMember}
                      index={0}
                      onClick={() => {}}
                    />
                  </div>
                  <small style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '240px' }}>
                    Card hiển thị trên trang chính sẽ giống hệt như thế này.
                  </small>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button className="btn-secondary" onClick={() => setIsFormModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button className="btn-primary" onClick={handleFormSubmit}>
                  Lưu thay đổi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && memberToDelete && (
          <div className="admin-modal-overlay">
            <motion.div
              className="admin-modal admin-confirm-modal glass-panel"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            >
              <div className="admin-modal-header" style={{ justifyContent: 'center' }}>
                <h2 className="admin-modal-title">Xóa thành viên?</h2>
              </div>
              <div className="admin-modal-content" style={{ display: 'block', padding: '20px 30px' }}>
                <div className="confirm-icon">⚠️</div>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px' }}>
                  Bạn có chắc chắn muốn xóa thành viên "{memberToDelete.name}"?
                </p>
                <p className="confirm-text">
                  Hành động này không thể hoàn tác. Mọi lời chúc và dữ liệu liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống.
                </p>
              </div>
              <div className="admin-modal-footer" style={{ justifyContent: 'center', gap: '15px' }}>
                <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
                  Hủy
                </button>
                <button className="btn-primary btn-danger" onClick={handleDeleteConfirm}>
                  Đồng ý Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE FEEDBACK MODAL */}
      <AnimatePresence>
        {isDeleteFeedbackModalOpen && feedbackToDelete && (
          <div className="admin-modal-overlay">
            <motion.div
              className="admin-modal admin-confirm-modal glass-panel"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            >
              <div className="admin-modal-header" style={{ justifyContent: 'center' }}>
                <h2 className="admin-modal-title">Xóa lời nhắn?</h2>
              </div>
              <div className="admin-modal-content" style={{ display: 'block', padding: '20px 30px' }}>
                <div className="confirm-icon">🗑️</div>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px' }}>
                  Xóa lời nhắn của "{feedbackToDelete.memberName}"?
                </p>
                <div className="admin-feedback-preview-box">
                  <p>{feedbackToDelete.content}</p>
                </div>
                <p className="confirm-text" style={{ marginTop: '15px' }}>
                  Hành động này không thể hoàn tác.
                </p>
              </div>
              <div className="admin-modal-footer" style={{ justifyContent: 'center', gap: '15px' }}>
                <button className="btn-secondary" onClick={() => setIsDeleteFeedbackModalOpen(false)}>
                  Hủy
                </button>
                <button className="btn-primary btn-danger" onClick={handleDeleteFeedbackConfirm}>
                  Đồng ý Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST SYSTEM */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            className={`admin-toast admin-toast-${toast.type}`}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <span>{toast.type === 'success' ? '✅' : '❌'}</span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
