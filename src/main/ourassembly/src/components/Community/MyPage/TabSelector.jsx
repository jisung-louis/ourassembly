export function TabSelector({ activeTab, onTabChange, boardCount, replyCount, giftCount,followCount }) {
    return (
        <div className="comm-nav">
            <button className={`comm-nav__tab ${activeTab === 'boards' ? 'is-active' : ''}`} onClick={() => onTabChange('boards')} type="button">내 게시글 ({boardCount})</button>
            <button className={`comm-nav__tab ${activeTab === 'replies' ? 'is-active' : ''}`} onClick={() => onTabChange('replies')} type="button">내 댓글 ({replyCount})</button>
            <button className={`comm-nav__tab ${activeTab === 'gifts' ? 'is-active' : ''}`} onClick={() => onTabChange('gifts')} type="button">기프티콘 ({giftCount})</button>
            <button className={`comm-nav__tab ${activeTab === 'follows' ? 'is-active' : ''}`} onClick={() => onTabChange('follows')}type="button">내 팔로우 목록 ({followCount})</button>
        </div>
    )
}