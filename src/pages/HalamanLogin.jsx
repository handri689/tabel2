import {useState} from "react";
import { useNavigate } from "react-router-dom";
import {supabase} from "../supabase";
function HalamanLogin(){
    const navigate = useNavigate();
    const [form,setForm] = useState ({email: '', password: ''});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
const login = async ()=> { //membuat fungsi login yang bersifat async (asynchronous), karena akan menunggu proses dari supbase 
    setError('');   //reset pesan error dulu setiap kali tombol login diklik, supaya eror lama hilang 
    setLoading(true);  //set loading jadi true biasanya dipakai untuk disable tombol atau tampilan spinner saat proses login berjalan 




//memanggil fungsi login dari supbase dengan email&dan password yang diisi user di form. await berarti menunggu sampai supbase selesai memproses. hasilnya di-destructure, hanya ambil erornya saja 
const { error} = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password,

});


//kalau supbase menggambil eror (login gagal): 
// tampilkan pesan "email atau password salah", 
// set loading kembali false . 
// returun akanmenghentikan fungsi agar tidak lanjut kebawah 
if (error)
{
    setError('Email atau Password Salah');
    setLoading(false);
    return;
}
navigate('/'); //kalau login berhasil (tidak ada eror), arahkan user ke halaman utama /.
};
return(
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        
     {/* logo    */}
     <div className="text-center mb-8">
        <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" heighat="28" viewBox="0 0 24 24" fill= "none" stroke= "white" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line xl="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
        </div>
        <h1 className="text-xl font-bold texet-gray-900">Data</h1>
        <p className="text-sm text-gray-400 mt-1">Masuk Sebagai Admin</p>
     </div>

     {/* eror */}
     {error&& (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24 " fill="none" stroke="currentColor" stroke-width="2">
            <circle cx= "12" cy="12" r="10"/>
            <line  xl= "12" y1="8" x2="12" y2="12"/>
            <line xl="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
            </div>
     )}
        {/* form */}
        <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider ,b-2">
                Email
            </label>
            <input
            type= "email"
            placeholder="surabaya@gmail.com"
            value={form.email}
            onChange={e => setForm({ ...form,email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition all bg-gray-50"/>

        </div>
        <div className="mb-6">
            <label className=" block-text-xs font-semibold  text-gray-500 uppercase tracking-wider mb -2">
                Password 
            </label>
            <input
            type="password"
            placeholder="12345kkkkk"
            value={form.password}
            onChange={e => setForm({ ...form,password: e.target.value})}
            onKeyDown={e =>e.key === 'enter' && login()}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50"/>
            </div>
            <button
            onClick={login}
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-color cursor-pointer disabled:opacity-50">
                {loading ? 'Memuat...' :'Masuk Ke Dashboard'}
            </button>
            </div>
        </div>
);
}
export default HalamanLogin;
