import { BrowserRouter,Routes,Route,Navigate } from "react-router-dom";
import { useEffect,useState } from "react";
import { supabase } from "./supabase";
import TabelPengguna from './TabelPengguna'; //kode lama
import HalamanDetail from "./pages/HalamanDetail";
import HalamanTambah from "./pages/HalmanTambah";
import HalamanLogin from "./pages/HalamanLogin";
function App(){
  const [user,setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=> {
    supabase.auth.getSession().then(({data})=>{
      setUser(data.session?.user ?? null);
      setLoading(false);
  });
  supabase.auth.onAuthStateChange((_event, session) =>{
    setUser(session?.user ?? null);
  });
  }, []);
  if (loading){
    return(
      <div className="min-h-screen flex items-center justify-center"> 
      <p className="text-gray-400">Memuat...</p>
      </div>
    );
  }
  return(
    <BrowserRouter>
    <Routes>
      {/* Login - Kalaua suda login langsung ke home */}
      <Route path="/login" element={!user ? <HalamanLogin /> :<Navigate to="/" />}/>

      {/* Halaman Yang Butuh Login */}

      <Route path="/"element={user ? <TabelPengguna />: <Navigate to="/login"/>} />
      <Route path="/tambah"element={user ?<HalamanTambah />: <Navigate to ="/login"/>}/>
      <Route path="/detail/:id" element={user ? <HalamanDetail />: <Navigate to= "/login" />} />

      {/* 404 */}
      <Route path="*"element={<h2 style={{textAlign: 'center'}}>404 - Halaman Tidak Ditemukan</h2>} />
    </Routes>
    </BrowserRouter>
  );
}
export default App;