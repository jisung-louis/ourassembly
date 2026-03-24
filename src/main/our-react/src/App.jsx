// src/App.jsx
import User from "./user/User"; // ./user/ 폴더 안의 User 파일을 가져옴

function App() {
  return (
      <>
        {/* <h2> React 기본형 </h2> <- 이걸 지우고 아래처럼 User를 넣으세요 */}
        <User />
      </>
  );
}

export default App;