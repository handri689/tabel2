import { useState} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function Halamantambah(){
const navigate = useNavigate();//fungsi untuk pindah halaman


//menyimpan nilai input form, nama, usia , kota , aktif
const [form, setForm] = useState({
  nama:'',
  usia:'',
  Kota:'',
  Aktif:'',
});

//menyimpan pesan eror tiap field.kosong = tidak ada eror
const [errors,setErrors] = useState({});
//fungsi falidasi cek semua filed sebelum simpan
const validasi =() => {
  const err ={};
  if (!form.nama.trim()) err.nama='nama wajib diisi'; //nama kosong
  if(form.nama.trim().length<3) err.nama='nama minimal 3 huruf'; //nama terlalu pendek
  if(!form.usia) err.usia='usia wajib diisi';// usia kosong
  if(Number(form.usia) <= 0) err.usia='usia harus lebih dari 0';//usia tidak valid
  if (Number(form.usia)>120) err.usia='usia tidak valid';//usia terlalu besar
  if(!form.Kota.trim()) err.Kota='kota wajib diisi'; //kota kosong
  return err; //kembalikan object eror
};
//fungsi simpan. dijalankan saat tombol simpan di klik

const simpan = async() =>{
  const err = validasi();
  if (Object.keys(err). length > 0){ setErrors(err); return; }
  const {error} = await supabase
  .from('pengguna')
  .insert([{
    nama: form.nama,
    usia: Number(form.usia),
    Kota: form.Kota,
    Aktif: form.Aktif ===''? true : form.Aktif
  }]);
  if (error) {console.log('error:',error); return;}
  navigate('/', {state: {pesan: '✅ Data berhasil ditambahkan!', warna: 'hijau'}})
  };
//class input, merah kalau ada yang eror, normal kalau tidak
const inputClass = (field)=>
  `w-full px-3 py2.5 rounded-lg border text-sm outline-none transition-colors focus:ring-2 ${
    errors[field]
    ? 'border-red-400 focus: ring-red-300' //merah kalau eror
    : 'border-gray-300 focus: ring-purple-300' //normal kalu tidak eror
  }`;
  return(
    //wraper utama-tengah layar dengan bacground ungu muda
    <div className="min-h-screen bg-linear-to-br from-white via-purple-50 to-white flex justyfy-center items-start p-8">

      {/* kotak form */}
      {/* <div className="w-full max-w-md bg-white rounded-2xl p-8 shodowlg"> */}
<div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg mx-auto">
        {/* header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 -0">
            Tambah Penguna
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Isi Semua Kolom Dengan Benar
          </p>
        </div>

        {/* field nama */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Nama
          </label>
          <input
          placeholder="contoh:Handri Turino"
          value={form.nama}
          onChange={e => {
            setForm({...form, nama: e.target.value});//update nilai nama
            setErrors({ ...errors, nama: ''}); //hapus error nama saat mengetik
          
          }}
          className={inputClass('nama')} //class e merah atau normal
          />

          {/* pesan eror nama hanya muncul kalau ada eror */}
{errors.nama &&(
  <p className="text-red-500 text-xs mt-1">⚠️{errors.nama}</p>
)}
</div>
{/* field usia */}
<div className="mb-4">
  <label className="text-xs font-madium text-gray-700 block mb-1">
    Usia
  </label>
  <input
  type="number"
  placeholder="Contoh:24"
  value={form.usia}
  onChange={e => {
    setForm({ ...form,usia: e.target.value}) //update nilai usia
    setErrors({...errors,usia: '' }); //hapus eror usia saat mengetik

  }}
  className={inputClass('usia')}
  />
  {/* pesan eror usia */}
  {errors.usia &&(
    <p className="text-red-500 text-xs mt-1">⚠️{errors.usia}</p>
  )}
</div>
{/* field kota */}
<div className="mb-4">
<label lassName="text-xs font- medium text-gray-700 block mb-1">
  Kota
  </label>
<input
            placeholder="Contoh: Surabaya"
            value={form.Kota}
            onChange={e => {
              setForm({ ...form, Kota: e.target.value }); // update nilai kota
              setErrors({ ...errors, Kota: '' });          // hapus error kota saat mengetik
            }}
            className={inputClass('Kota')}
          />
          {/* PESAN ERROR KOTA */}
          {errors.Kota && (
            <p className="text-red-500 text-xs mt-1">⚠️ {errors.Kota}</p>
          )}
        </div>
 
        {/* FIELD STATUS */}
        <div className="mb-6">
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Status
          </label>
          <select
            value={form.Aktif}
            onChange={e => setForm({ ...form, Aktif: e.target.value === 'true' })} // ubah string jadi boolean
            className={inputClass('Aktif')}
          >
            <option value="true">Aktif</option>
            <option value="false">Tidak Aktif</option>
          </select>
        </div>
 
        {/* TOMBOL AKSI */}
        <div className="flex gap-2">
 
          {/* TOMBOL BATAL — kembali ke tabel tanpa simpan */}
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
 
          {/* TOMBOL SIMPAN — jalankan fungsi simpan */}
          <button
            onClick={simpan}
            className="flex-2 grow-2 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
          >
            + Simpan Data
          </button>
 
        </div>
 
      </div>
    </div>
  );
}
 
export default Halamantambah; // export agar bisa diimport di App.jsx
