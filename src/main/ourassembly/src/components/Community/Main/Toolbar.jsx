import { useState } from 'react'
import { DistrictSelect } from './DistrictSelect.jsx'

export function Toolbar({ district, onDistrictChange, searchPlaceholder, onSearch, onWrite }) {
  const [input, setInput] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSearch(input.trim())
  }

  return (
    <div className="comm-toolbar">
      <DistrictSelect value={district} onChange={onDistrictChange} />

      <form className="comm-search" onSubmit={handleSubmit}>
        <span className="comm-search__icon">🔍</span>
        <input
          className="comm-search__input"
          placeholder={searchPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>

      <button className="button button--primary" onClick={onWrite} type="button">글쓰기</button>
    </div>
  )
}
