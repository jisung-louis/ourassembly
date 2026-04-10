import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createBoard, updateBoard, fetchBoardDetail } from '../../services/communityApi.js'
import { getStoredAuthUser } from '../../services/auth.js'
import {DistrictSelect} from '../../components/Community/Main/DistrictSelect.jsx'

export function WritePage() {
  const { boardId } = useParams()
  const isEdit = Boolean(boardId)
  const navigate = useNavigate()
  const currentUser = getStoredAuthUser()

  const [district, setDistrict] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!currentUser) { alert('로그인이 필요합니다.'); navigate('/community'); return }
    if (isEdit) {
      fetchBoardDetail(boardId)
        .then((data) => { setTitle(data.title || ''); setContent(data.content || ''); setDistrict(data.district || '') })
        .catch(() => { alert('게시글 정보를 불러오지 못했습니다.'); navigate('/community') })
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault(); setError('')
    if (!district) { setError('지역을 선택해 주세요.'); return }
    if (!title.trim()) { setError('제목을 입력해 주세요.'); return }
    if (!content.trim()) { setError('내용을 입력해 주세요.'); return }
    setIsSaving(true)
    try {
      if (isEdit) await updateBoard({ boardId: Number(boardId), title: title.trim(), content: content.trim(), district, user: { id: currentUser.id } })
      else await createBoard({ title: title.trim(), content: content.trim(), district })
      navigate('/community')
    } catch (e) { setError(e.message) }
    finally { setIsSaving(false) }
  }

  return (
    <>
      <button className="comm-back" onClick={() => navigate('/community')} type="button">← 목록으로</button>
      <form className="write-box" onSubmit={handleSubmit}>
        <div>
          <label className="write-label">지역 선택</label>
          <DistrictSelect value={district} onChange={setDistrict} excludeAll disabled={isSaving} />
        </div>
        <div>
          <label className="write-label">제목</label>
          <input className="write-input" placeholder="제목을 입력해 주세요" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSaving} />
        </div>
        <div>
          <label className="write-label">내용</label>
          <textarea className="write-input write-textarea" placeholder="내용을 작성해 주세요" value={content} onChange={(e) => setContent(e.target.value)} disabled={isSaving} />
        </div>
        {error && <p className="write-error">{error}</p>}
        <div className="write-actions">
          <button className="button button--soft" onClick={() => navigate('/community')} disabled={isSaving} type="button">취소</button>
          <button className="button button--primary" disabled={isSaving} type="submit">{isSaving ? '저장 중...' : isEdit ? '수정 완료' : '등록하기'}</button>
        </div>
      </form>
    </>
  )
}
