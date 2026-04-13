import { getAuthorizationHeader } from './auth.js'
import axios from 'axios'

import { apiClient as client } from './apiClient.js'

function auth() {
  const h = getAuthorizationHeader()
  return h ? { Authorization: h } : {}
}

function errMsg(e, fb) {
  if (!axios.isAxiosError(e) || !e.response) return fb
  const b = e.response.data
  if (typeof b === 'string' && b.trim()) return b
  if (b?.message) return b.message
  return fb
}

// Board
export async function fetchBoards({ district, sort = 'latest', page = 1, size = 10 } = {}) {
  try { const p = { sort, page, size }; if (district) p.district = district; return (await client.get('/api/board', { params: p })).data } catch (e) { throw new Error(errMsg(e, '게시글 목록을 불러오지 못했습니다.')) }
}
export async function fetchBoardDetail(boardId) {
  try { return (await client.get('/api/board/detail', { params: { boardId } })).data } catch (e) { throw new Error(errMsg(e, '게시글을 불러오지 못했습니다.')) }
}
export async function searchBoards({ district, keyword, page = 1, size = 10 }) {
  try { const p = { keyword, page, size }; if (district) p.district = district; return (await client.get('/api/board/search', { params: p })).data } catch (e) { throw new Error(errMsg(e, '검색에 실패했습니다.')) }
}
export async function createBoard({ title, content, district }) {
  try { return (await client.post('/api/board', { title, content, district }, { headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '글 작성에 실패했습니다.')) }
}
export async function updateBoard({ boardId, title, content, district, user }) {
  try { return (await client.put('/api/board', { boardId, title, content, district, user }, { headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '글 수정에 실패했습니다.')) }
}
export async function deleteBoard(boardId) {
  try { return (await client.delete('/api/board', { params: { boardId }, headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '글 삭제에 실패했습니다.')) }
}
export async function toggleBoardLike(boardId) {
  try { return (await client.post('/api/board/like', null, { params: { boardId }, headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '좋아요 처리에 실패했습니다.')) }
}

// Reply
export async function fetchReplies(boardId) {
  try { return (await client.get('/api/reply', { params: { boardId } })).data } catch (e) { throw new Error(errMsg(e, '댓글을 불러오지 못했습니다.')) }
}
export async function createReply({ boardId, content }) {
  try { return (await client.post('/api/reply', { content }, { params: { boardId }, headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '댓글 작성에 실패했습니다.')) }
}
export async function updateReply({ replyId, content }) {
  try { return (await client.put('/api/reply', { replyId, content }, { headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '댓글 수정에 실패했습니다.')) }
}
export async function deleteReply(replyId) {
  try { return (await client.delete('/api/reply', { params: { replyId }, headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '댓글 삭제에 실패했습니다.')) }
}

// Shop
export async function fetchProducts({ sort = 'latest', page = 1, size = 10 } = {}) {
  try { return (await client.get('/api/product', { params: { sort, page, size } })).data } catch (e) { throw new Error(errMsg(e, '상품 목록을 불러오지 못했습니다.')) }
}
export async function buyProduct(productId) {
  try { return (await client.post('/api/buy', null, { params: { productId }, headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '구매에 실패했습니다.')) }
}
export async function fetchMyGifts() {
  try { return (await client.get('/api/user/mygift', { headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '기프티콘을 불러오지 못했습니다.')) }
}

export async function deleteProduct(productId) {
  try { return (await client.delete('/api/product', { params: { productId }, headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '상품 삭제에 실패했습니다.')) }
}


// MyPage
export async function fetchMyInfo() {
  try { return (await client.get('/api/user/myinfo', { headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '내 정보를 불러오지 못했습니다.')) }
}
export async function fetchMyBoards() {
  try { return (await client.get('/api/user/myboard', { headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '내 게시글을 불러오지 못했습니다.')) }
}
export async function fetchMyReplies() {
  try { return (await client.get('/api/user/myreply', { headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '내 댓글을 불러오지 못했습니다.')) }
}
export async function fetchMyPoint() {
  try { return (await client.get('/api/user/mypoint', { headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '포인트를 불러오지 못했습니다.')) }
}
export async function fetchMyFollows() {try { return (await client.get('/api/follow', { headers: auth() })).data } catch (e) {throw new Error(errMsg(e, '팔로우 목록을 불러오지 못했습니다.'))}
}
export async function unfollowMember(congressmanId) {
  try { return (await client.delete(`/api/follow/${congressmanId}`, { headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '언팔로우에 실패했습니다.')) }
}
// admin
export async function fetchAdminStats() {
  try { return (await client.get('/api/admin/stats', { headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '통계를 불러오지 못했습니다.')) }
}
export async function fetchAdminCommunity() {
  try { return (await client.get('/api/admin/community', { headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '커뮤니티 현황을 불러오지 못했습니다.')) }
}
export async function fetchAdminUsers() {
  try { return (await client.get('/api/admin/users', { headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '회원 현황을 불러오지 못했습니다.')) }
}
export async function fetchAdminPoints() {
  try { return (await client.get('/api/admin/points', { headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '포인트 현황을 불러오지 못했습니다.')) }
}
export async function fetchAdminOpinions() {
  try { return (await client.get('/api/admin/opinions', { headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '의견 현황을 불러오지 못했습니다.')) }
}

export async function syncBill() {
  try { return (await client.post('/api/bill/sync', {}, { headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '법안 동기화 실패')) }
}
export async function syncNews() {
  try { return (await client.post('/api/news/sync', {}, { headers: auth() })).data } catch (e) { throw new Error(errMsg(e, '뉴스 크롤링 실패')) }
}





export async function sendPushNotification(payload) {
  try {
    const response = await client.post('/api/admin/push', payload, {
      headers: auth()
    });
    return response.data;
  } catch (e) {
    throw new Error(errMsg(e, '알림 발송에 실패했습니다.'));
  }
}
