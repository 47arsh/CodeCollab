import {BrowserRouter, Routes, Route} from 'react-router-dom'
// import {Toaster} from 'react-hot-toast'
import Home from './pages/Home'
import EditorPage from './pages/EditorPage'

function App() {
  return (
    <div>
    <div>
      {/* <Toaster 
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      /> */}
    </div>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/editor/:roomId' element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
    </div>
)
}

export default App
