import { DistrictSelect } from '../Shared.jsx'

export function WriteForm({ district, title, content, onDistrictChange, onTitleChange, onContentChange, isEdit }) {
  return (
    <>
      <div>
        <label className="write-label">지역 선택</label>
        <DistrictSelect value={district} onChange={onDistrictChange} excludeAll disabled={isEdit} />
      </div>
      <div>
        <label className="write-label">제목</label>
        <input className="write-input" placeholder="제목을 입력해 주세요" value={title} onChange={(e) => onTitleChange(e.target.value)} />
      </div>
      <div>
        <label className="write-label">내용</label>
        <textarea className="write-input write-textarea" placeholder="내용을 작성해 주세요" value={content} onChange={(e) => onContentChange(e.target.value)} />
      </div>
    </>
  )
}
