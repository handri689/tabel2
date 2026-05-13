import { BrowserRouter,Routes,Route } from "react-router-dom";
import TabelPengguna from './TabelPengguna'; //kode lama
import HalamanDetail from "./pages/HalamanDetail";
import HalamanTambah from "./pages/HalmanTambah";
function App(){
  return(
    <BrowserRouter>
    <Routes>
      <Route path="/"           element={<TabelPengguna />} />
      <Route path="/tambah"      element={<HalamanTambah />}/>
      <Route path="/detail/:id" element={<HalamanDetail />} />
      <Route path="*"           element={<h2 style={{textAlign: 'center'}}>404 - Halaman Tidak Ditemukan</h2>} />


    </Routes>
    </BrowserRouter>
  );
}
export default App;