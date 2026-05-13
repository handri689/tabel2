import { useParams, useNavigate} from "react-router-dom";
function HalamanDetail(){
    const {id} = useParams(); //ambil id dri url/detail/3
    const navigate= useNavigate(); //untuk tombol kembali
    //ambil data dari local storage
    const data = JSON.parse(localStorage.getItem('penggunData')) || [];
    const orang = data.find(o => o.id === Number(id));
     
    

    //kalau id tidak diteukan
    if(!orang){
      return(
    //text-center: text rata tengah
      <div className="flex flex-col items-center justify-center mt-16 text-center">
        <p className="text-6x1">😕</p>
        <h2  className="text-2x1 font-bold mt-4">Data Tidak Ditemmukan</h2>
        <p className="text-gray-500 mt-2"> ID "{id}" Tidak Ada di Data</p>
        <button
    //text-center   : text rata tengah, mt-16: margin atas 4rem, justify-center: rata tengah vertikal
    //flex          : aktifkan flexbox
    //flec-col      : susun anak elemen ke bawah 
    //items-center  : rata tengah horizontal
    //justify-center: rata tengah vertikal
    //mt-6          :margin atas 4rem(64px)
onClick={() => navigate('/')}
  className="mt-6 px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
    
          ← Kembali ke Tabel
        </button>
      </div>
    );
  }
      // mt-6       : margin atas 1.5rem
      // px-6       : padding kiri kanan 1.5rem
      // py-2.5     : padding atas bawah 0.625rem
      // bg-blue-500: background biru
      // text white : teks putih
      // rounded-lg : sudut membulat sedang
      // hover      : bg-blue-600:  saat hover biru lebih gelap
      // transition-colors: animasi perubahan warna
      // cursor pointr: cursor jadi tangan
      
return(
  <div className="flex justify-center p-8">
    <div className="w-96 bg-white rounded-3xl p-7 shadow-lg">
      {/* 
      flex justyfy-center : card berada di tengah layar
      p-8                 : padding semua sisi 2 rem 
      w-96                : lebar card 24rem (384px)
      bg-white            : background putih
      rounded-3x1         : sudut sangat membulat
      p-7                 : padding dalam card 1.75rem
      shadow-lg           : bayangan besar dibawah card
      */}

      {/* avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center text-4xl font-bold mb-3">
          {/* /
          
          mb-6          : margin bawah 1.5rem
          w-20 h-20     : lebar dan tinggi 5rem(80px)
          rounded-full  : bentuk lingkaran yang sempurna 
          bg-blue-500   : background biru
          text-4x1      : font besar untuk inisial
          font-bold     : tebal
          mb-            : margin bawah 0,75rem
          */}
          
          {orang.nama.charAt(0)}
        </div>
        <h2 className="text-2xl font-bold m-0">{orang.nama}</h2>
        <p className="text-gray-400 text-sm mt-1"> ID pengguna: #{orang.id}</p>

      {/* 
      
      text 2x1      : font ukuran 1.5rem
      font-bold     : tabel
      m-0           : hapus margin default h2
      text-gray-400 : warna abu muda
      text-sm       : font kecil 0.875rem
      mt-1          : margin atas 0.25rm
      */}

      </div>
      {/* info */}
      <div className="flex flex-col gap-3">
        {/* usia */}
        <div className="bg-gray-100 px-4 py-3 rounded-xl">
          <div className="text-xs text-gray-400 mb-1">Usia</div>
          <div className="font-semibold">{orang.usia} Tahun</div>
        </div>
        {/* kota */}
        <div className="bg-gray-100 px-4 py-3 rounded-x1">
        <div className=" text-xs text-gray-400 mb-1">Kota</div>
          <div className="font-semibold">{orang.Kota}</div>
        </div>

        {/* 
        gab-3           : jarak antara card info 0.75rem
        bg-gray-100     : backgraound abu sangat mudah
        px-4 py-3       : padding horizontal 1rem, vertikal 0.75rem
        rounded-x1      : sudut membulat
        text-xs         : font sangat kecil(label)
        text-gray-400   : warna abu untuk label
        mb-1            : jarak labek ke nilai 0.25rem
        font-semibold   : nilai agak tebal
        */}

        {/* status */}
        <div className={`px-4 py-3 rounded-x1 ${orang.Aktif ? 'bg-green-50':'bg-red-50'}`}>
          <div className="text-xs text-gray-400 mb-1">Status</div>
          <div className={`font-semibold ${orang.Aktif ? 'text-green-800':'text-red-800'}`}>
            {orang.Aktif ? '🟢 Aktif' : '🔴 Tidak Aktif'}

            {/* 
            orang.Aktif = true    bg-green-50 (hijau muda)   text-green-800 (hijau tua)
            orang.Aktif = false   bg-red-50 (merah muda)      text-red-800 (merah tua)
            */}
          </div>
        </div>
      </div>
      {/* tombool kembali */}
      <button
      onClick={()=> navigate('/')}
      className="w-full mt-6 py-3 bg-gray-900 text-white rounded-x1 text-base font-semibold hover:bg-gray-700 transition-colors cursor-pointer">
        ← Kembali ke Tabel
        {/* 
        w-fuul        : lebar 100% mengisi card
        mt-6          : margin atas 1.5rem
        py-3          : padding atas-bawah 0.75rem
        bg-gray-900   : background hitam gelap
        text-base     : font ukuran normal 1rem
        font-semibold : agak tebal
        hover         : bg-gray-700 saat hover -> sedikit lebih terang
        */}
      </button>
    </div>
  </div>
);
}
export default HalamanDetail;