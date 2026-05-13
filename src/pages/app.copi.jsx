import React, {useEffect, useState, useRef} from 'react'; // ← tambah useRef
import jsPDF from 'jspdf';
// ← hapus baris autotable
//data default yang muncul perta makali kalau local storage kosong
const dataAwal =[
  {id: 1, nama: 'Budi Santoso', usia: 30, Kota: 'Suarabaya',Aktif: true},
  {id: 2, nama: 'Handri Turino', usia: 24, Kota: 'NTT', Aktif: true },
  {id: 3, nama: 'Siti Aminah', usia: 28, Kota: 'Jakarta',Aktif: false},
  {id: 4, nama: 'Rina Pertiwi', usia: 26, Kota:'Bandung', Aktif: true},
  {id: 5, nama: 'Ahmad Fauzi', usia: 25, Kota:'Semarang',Aktif: false},
];

function TabelPengguna(){ //deklarasi komonenen utama bernama TabelPengguna
  //STATE
  const [detail, setDetail] = useState(null); //menyimpan data orang yang  sedang dilihat dimodal detail. nuul artinya modal detail
  const [data, setData] = useState(() =>{    //menyimpan seluruh data tabel . saat pertama buka, cek lokal storage dulu-kalau ada pake itu kalau tidak ada pake data awal
    const tersimpan = localStorage.getItem('penggunData');  //coba baca data dari local storage
    return tersimpan ? JSON.parse(tersimpan) : dataAwal; //kalau ada pake itu, kalau tidak ada pake data awal
  });
  //form menyimpan nilai input pada form tambah data baru
  //nilai awal semua kosong kecuali aktif yang default true 
  const [form, setForm] = useState({nama:'', usia:'', Kota:'', Aktif:true});
  //const [nextId, setNextId] = useState(6); //id untuk data baru . dimulai dari 6 karena data awal dimulai 1-5
    //fokus utama keKolom yang diklik  
  useEffect(() => { // saat data berubah (tambah/hapus/edit) otomatis simpan ke localstorage agar tidak hilaang saatv refres
    localStorage.setItem('penggunData', JSON.stringify(data));
  },[data]);
    //null= tidak tampil,{id,nama}= tampil
  const [konfirmasi,setKonfirmasi] = useState(null);

  const tambahData = () => { //validasi, jangan simpan kalau kosong
    if (!form.nama || !form.usia || !form.Kota) {
      tampilNotif(' ⚠️ Semua Kolom Harus Diisi!', 'merah');
      return;
    }
    const idBaru = data.length > 0 ? Math.max(...data.map(o=>o.id)) + 1:1;
    const baru = {id:idBaru, ...form, usia: Number(form.usia)};
    setData([...data,baru]);
    setForm({nama:'', usia: '', Kota: '', Aktif :true});
    tampilNotif('✅Data berhasil ditambahkan!', 'hijau');
  
  };

  const hapusData = (id,nama) => {
    setKonfirmasi({id,nama}); 
  };
  const konfirmasiHapus = () =>{
    setData(data.filter(orang => orang.id !== konfirmasi.id));
    tampilNotif('🗑 Data Berhasil Dihapus!', 'merah');
    setKonfirmasi(null); //tutup modal
  };


  const LihatDetail = (orang) => { //simpan data orang ke state , moal otomatis muncul
    setDetail(orang);
  };
  //notif: menyimpan objek notifikasi {pesan, warna} yang tampil sementara 
  //null artinya tidak ada notifikasi yanng tampil
const[notif,setNotif] = useState(null); 

//pesan warna
const tampilNotif = (pesan,warna='hijau')=>{
  setNotif({pesan,warna});
  setTimeout(()=> setNotif(null),3000); //hilan otomatis 3 detik
}
//filter: menyimpan pilhan filter aktif (semua,aktif, tidak aktif)
  const [filter, setFilter] = useState('semua');
  // searchinput: nilai sementara di kotak pencarian(belum dipakai untuk filter)
const [searchInput, setSearchInput] = useState(''); // ← input sementara
const [search, setSearch] = useState('');            // ← search yang aktif

  const dataFiltered = data.filter(orang => {
    const cocokFilter =
      filter === 'aktif' ? orang.Aktif === true :
      filter === 'tidak' ? orang.Aktif === false : true;
    const cocokSearch = //cek apakah nama, kota, usia mengandung data yang dicari
      orang.nama.toLowerCase().includes(search.toLowerCase()) ||
      orang.Kota.toLowerCase().includes(search.toLowerCase()) ||
      orang.usia.toString().includes(search)  
      return cocokFilter && cocokSearch; //kedua harus terpenuhi
  });
  // halaman: menyimpan nomor halaman yang sedang ditapilkan (pagination)
      const [halaman,setHalaman] = useState(1);
  const dataPerHalaman = 5; //tampilkan 5 data pertama 
  
      const totalHalaman = Math.ceil(dataFiltered.length / dataPerHalaman);
  const dataHalaman = dataFiltered.slice(
    (halaman - 1) *dataPerHalaman, //index mulai
    halaman * dataPerHalaman 
  );

//edittarget: menyimpan id baris yang sedang dibuat 
//nul artinya tidak ada baris yang sedang dibuat 
  const [editTarget, setEditTarget] = useState(null); //menyimpan id baris yang  sedang di edit. null artinya tidak ada yanng diedit
  const [editForm, setEditForm] = useState({nama:'', usia:'', Kota:'', Aktif:true}); //menyompan nilai inputan saat sedang diedit

  // ← TAMBAH INI
  //ref untuk  id yang sedang diedit , menghindari masalah clousure di setTimeout
  const editTargetRef = useRef(null); //menyimpan id target tanpa kena closure
  //ref untuk nilai edit form terbaru, agar simpan edit selalu membaca nilai mutakhir
           const editFormRef = useRef(editForm); 
  //ref untuk menyimpan id timeout ,agar bisa dibatalkan saat pindah kolom
  const timeoutRef = useRef(null);

  //tambah ref untuk tiap inputan
                  const namaRef = useRef(null) //refrensi ke input nama  di DOM 
  const usiaRef = useRef(null)
    const KotaRef = useRef(null)
      const AktifRef = useRef(null)
  const [editKolom, seteditKolom] = useState(null);

  //hitung statistik
  const totalData = data.length;
  const totalAktif = data.filter(o=> o.Aktif === true).length; //data.filter(o => o.Aktif === true) — menyaring array, hanya ambil orang yang Aktif-nya true
//length hitung  berapa hasil saringan tadi
  const totoalTidakAktif = data.filter(o => o.Aktif=== false).length;

  // ← TAMBAH INI — selalu update ref saat editForm berubah
  
  useEffect(() => {
    editFormRef.current = editForm; //setiap kali edit form berubah (user mengetik), update editFormRef agar simpan edit selalu baca nilai terbaru
  }, [editForm]);
  useEffect(() =>{
    if(editKolom === 'nama') namaRef.current?.focus();
    if(editKolom === 'usia') usiaRef.current?.focus();
    if(editKolom === 'Kota') KotaRef.current?.focus();
    if(editKolom === 'Aktif') AktifRef.current?.focus();

  },[editKolom,editTarget]);
  
//menyimpan kolom mana yang diklik(nama, usia,kota) akar fokus bisa diarahkan ke input yang tepat
  const bukaEdit = (id, Kolom) => {
    clearTimeout(timeoutRef.current); // ← batalkan simpan kalau pindah kolom
    editTargetRef.current = id;
    setEditTarget(id);
    seteditKolom(Kolom);
    const orang = data.find(o => o.id === id);
    setEditForm({nama: orang.nama, usia: orang.usia, Kota: orang.Kota, Aktif: orang.Aktif});//isi form dengan data lama 
  };
  const [darkMode, setDarkMode] = useState(false); //false =light, true=dark
  

  const simpanEdit = () => {
    const idTarget = editTargetRef.current; //membaca dari ref agar tidak kena closure
    const formSaat = editFormRef.current; // ← pakai ref bukan state
    if (!idTarget) return; //tidak ada yang diedit keluar

    setData(prev => prev.map(o =>
      o.id === idTarget //ganti data lama dengan yang baru
        ? { ...o, ...formSaat, usia: Number(formSaat.usia) }
        : o
    ));
    setEditTarget(null);
    editTargetRef.current = null;
    tampilNotif('✏️ Data Berhasil diupdate!', 'biru');
  };
console.log(data.map(o => ({ id: o.id, nama: o.nama })))
//export exve//csv
const exportCSV = () =>{
  //buat baris judul kolom
  const header =['ID','NAMA','USIA','KOTA','STATUS'];
  //ubah setiap data menjadi  baris csv
  const baris = data.map(o=>[
    o.id,
    o.nama,
    o.usia,
    o.Kota,
    o.Aktif? 'Aktif' : 'Tidak Aktif'
  ]);
//gabungan header +baris menjadi string csv
const isiCSV = [header, ...baris]
.map(baris => baris.join(','))
.join('\n');
//buat file dan download otomatis
const blob = new Blob([isiCSV],{type: 'text/csv'});
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href =url;
link.download ='data-pengguna.csv';
link.click();
URL.revokeObjectURL(url);
tampilNotif(' 📥 data berhasil diexport','hijau');
};
const exportPDF = () => {
  const doc = new jsPDF();

  // judul
  doc.setFontSize(16);
  doc.text('Daftar Pengguna', 14, 15);

  // header tabel manual
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ID',  14, 30);
  doc.text('Nama', 25, 30);
  doc.text('Usia', 95, 30);
  doc.text('Kota', 115, 30);
  doc.text('Status', 155, 30);

  // garis bawah header
  doc.line(14, 32, 196, 32);

  // isi data
  doc.setFont('helvetica', 'normal');
  data.forEach((o, i) => {
    const y = 40 + (i * 10);
    doc.text(String(o.id),   14, y);
    doc.text(o.nama,          25, y);
    doc.text(String(o.usia),  95, y);
    doc.text(o.Kota,          115, y);
    doc.text(o.Aktif ? 'Aktif' : 'Tidak Aktif', 155, y);
  });

  doc.save('data-pengguna.pdf');
  tampilNotif('📄 Data berhasil diexport ke PDF!', 'biru');
};
//export pdf
  return (
    <div style={{
      minHeight: '100vh',
      background: darkMode
      ? 'linear-gradient(135deg, #1e1b4b, #2e1065, #1a0533)' //gelap
      : 'linear-gradient(135deg, #ffffff, #eee5ff, #ffffff)',//terang
      backgroundAttachment: 'fixed',
      padding: '20px',
      transition: 'all 0.3s ease'
    }}>
 
      {/* Notifikasi */}
      {notif && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '14px 20px',
          borderRadius: '12px',
          color: 'white',
          fontWeight: '600',
          fontSize: '15px',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          backgroundColor:
            notif.warna === 'hijau' ? '#22C55E' :
            notif.warna === 'merah' ? '#EF4444' : '#3B82F6',
          transition: 'all 0.3s ease'
        }}>
          {notif.pesan}
        </div>
      )}
 
<Search 
      filter={filter} setFilter={setFilter}
      searchInput={searchInput} setSearchInput={setSearchInput}
      search={search} setSearch={setSearch}
      darkMode={darkMode} setDarkMode={setDarkMode}
      exportCSV={exportCSV} exportPDF={exportPDF}
      />
<Tambah 
      setForm={setForm} tambahData={tambahData}
      form={form}/>
<Statistik 
     totalData={totalData}
     totalAktif={totalAktif}
     totoalTidakAktif={totoalTidakAktif}/>
 
<Tabel 
    editForm={editForm}
    setEditForm={setEditForm}
    bukaEdit={bukaEdit}
    LihatDetail={LihatDetail}
    hapusData={hapusData}
    darkMode={darkMode}
    dataHalaman={dataHalaman}
    editTarget={editTarget}
    namaRef={namaRef}
    usiaRef={usiaRef}
    KotaRef={KotaRef}
    AktifRef={AktifRef}
    timeoutRef={timeoutRef}
    simpanEdit={simpanEdit}/>

<Nexthalaman 
    halaman={halaman}
    totalHalaman={totalHalaman}
    setHalaman={setHalaman}/>

<Modalkonfirmasi 
    setKonfirmasi={setKonfirmasi}
    konfirmasiHapus={konfirmasiHapus}
    konfirmasi={konfirmasi}
    />


{/* info halaman */}
<div style={{textAlign: 'center',marginTop: '0.5rem',color: '#6bc280',fontSize: '13px'}}>
  Halaman {halaman} dari {totalHalaman} - Total{dataFiltered.length} data
      </div>
<Detail 
detail={detail}
setDetail={setDetail}
/>
  
    </div>
  );
}

function Search (props){
  const { filter, setFilter, searchInput, setSearchInput, 
          search, setSearch, darkMode, setDarkMode, 
          exportCSV, exportPDF } = props;
  return(
      <div style={{display: 'flex', gap: '8px', marginBottom: '3rem', alignItems: 'center', whiteSpace: 'nowrap', padding: '8px'}}>
        <button onClick={() => setFilter('semua')}>Semua</button>
        <button onClick={() => setFilter('aktif')}>Aktif</button>
        <button onClick={() => setFilter('tidak')}>Tidak Aktif</button>
        <input
          placeholder="Cari Kota/nama/usia..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
        />
        <button
          onClick={() => setSearch(searchInput)}
          style={{padding: '6px 16px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'}}
        >
          🔍 Search
        </button>
        {search && (
          <button
            onClick={() => {setSearch(''); setSearchInput('');}}
            style={{padding: '6px 12px', background: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer'}}
          >
            ✕ Reset
          </button>
        )}
          <button
          onClick={()=>setDarkMode(!darkMode)}
          style={{
            padding: '6px',
            background:darkMode ? '#facc15': '#1e1b4b',
            color: darkMode ? '#1e1b4b' : 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            marginLeft : 'auto' //dorong ke kanan
          }}
          > {darkMode ? '☀️ Light' : '🌙 Dark'}</button>
          
          
          <button
          onClick={()=>exportCSV()}
          style={{
            padding: '6px 16px',
            background: '#22c55e',
            color :'white',
            border: 'none',
            borderRadius: '8px',
            cursor : 'pointer',
            fontWeight : '600',

          }}
          >
           📥 Export CSV
        </button>
        <button
        onClick={() =>exportPDF()}
        style={{
          padding: '6px 16px',
    background: '#EF4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
        }}
        >📄 Export PDF</button>
    </div>
  )
}
function Tambah(props){
  const {form,setForm,tambahData}=props;
  return(
    <div>
         <div style={{display: 'flex', gap: '8px', marginBottom: '-4rem',justifyContent: 'flex-start', paddingLeft: '0'}}>
          <input placeholder="Nama" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})}/>
          <input placeholder="Usia" type="number" value={form.usia} onChange={e => setForm({...form, usia: e.target.value})} style={{width: '70px'}}/>
          <input placeholder="Kota" value={form.Kota} onChange={e => setForm({...form, Kota: e.target.value})}/>
          <select value={form.Aktif} onChange={e => setForm({...form, Aktif: e.target.value === 'true'})}>
            <option value="true">Aktif</option>
            <option value="false">Tidak Aktif</option>
          </select>
          <button
            onClick={() => tambahData()}
            style={{padding: '6px 16px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'}}
          >
            + Tambah
          </button>
        </div>
      </div>
  )
}
function Statistik(props){
  const {totalData, totalAktif,totoalTidakAktif}= props;
  return(
    <div style={{display: 'flex', gap: '12px', marginBottom: '0,5rem',justifyContent: 'flex-end', paddingLeft: '0'}}>
      <div style={{
        background: '#914e6a',
        border: '1px solid #f1f1f1',
        borderRadius: '12px',
        padding: '20px 20px',
        textAlign: 'center',
        minWidth: '100px'
      }}>
        <div style ={{fontSize: '30px', fontWeight: 'bold', color: '#110213'}}>
        {totalData}
        </div>
<div style ={{fontSize:'13px', color: '#010307'}}>Total Data</div>
    </div>

<div style={{
  background: '#373a13',
  border: '1px solid #00e751',
  borderRadius: '12px',
  padding: '12px 20px',
  textAlign: 'center',
  minWidth: '100px'
}}>
  <div style ={{fontSize: '30px', fontWeight: 'bold', color: '#22C55E'}}>
    {totalAktif}
  </div>
  <div style ={{fontSize: '13px', color: '#0c54e4'}}>AKTIF</div>
</div>
<div style={{
  background:'#71dafa',
  border: '1px solid #fecaca',
  borderRadius: '12px',
  padding: '12px 20px',
  textAlign: 'center',
  minWidth: '100px'
}}>
<div style= {{fontSize: '30px', fontWeight: 'bold', Color: '#ef4444'}}>
  {totoalTidakAktif}
</div>
<div style ={{fontSize: '13px', color: '#6b7280'}}>Tidak Aktif</div>
</div>
</div>
  )
}

function Tabel(props){
  const {editForm, setEditForm,bukaEdit, LihatDetail, hapusData,darkMode,dataHalaman,editTarget,namaRef, usiaRef, KotaRef, AktifRef,timeoutRef,simpanEdit}= props;
  return(
    <table border="1" style={{width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed'}}>
        <thead style={{backgroundColor: darkMode ? '#3b0764': '#000000',
          color: 'white'
        }}>
          {/* //tr di tbody - selang-seling warna */}
          <tr style={{textAlign: 'left'}}>
            <th style={{width: '40px'}}>NO</th>
            <th style={{width: '200px'}}>NAMA</th>
            <th style={{width: '60px'}}>USIA</th>
            <th style={{width: '200px'}}>KOTA</th>
            <th style={{width: '100px'}}>STATUS</th>
            <th style={{width: '200px'}}>AKSI</th>
          </tr>
        </thead>
        <tbody>
          {dataHalaman.map((orang, index) => (
            <tr key={orang.id} style={{textAlign: 'left'}}>
              <td>{index + 1}</td>
 
              {/* Nama */}
              <td>
                {editTarget === orang.id ? (
                  <input
                    ref={namaRef}
                    value={editForm.nama}
                    onChange={e => setEditForm({...editForm, nama: e.target.value})}
                    onBlur={() => {timeoutRef.current = setTimeout(simpanEdit, 200);}}
                  />
                ) : (
                  <span onClick={() => bukaEdit(orang.id, 'nama')} style={{cursor: 'pointer'}}>{orang.nama}</span>
                )}
              </td>
 
              {/* Usia */}
              <td>
                {editTarget === orang.id ? (
                  <input
                    ref={usiaRef}
                    type="number"
                    value={editForm.usia}
                    onChange={e => setEditForm({...editForm, usia: e.target.value})}
                    onBlur={() => {timeoutRef.current = setTimeout(simpanEdit, 200);}}
                    style={{width: '60px'}}
                  />
                ) : (
                  <span onClick={() => bukaEdit(orang.id, 'usia')} style={{cursor: 'pointer'}}>{orang.usia}</span>
                )}
              </td>
 
              {/* Kota */}
              <td>
                {editTarget === orang.id ? (
                  <input
                    ref={KotaRef}
                    value={editForm.Kota}
                    onChange={e => setEditForm({...editForm, Kota: e.target.value})}
                    onBlur={() => {timeoutRef.current = setTimeout(simpanEdit, 200);}}
                  />
                ) : (
                  <span onClick={() => bukaEdit(orang.id, 'Kota')} style={{cursor: 'pointer'}}>{orang.Kota}</span>
                )}
              </td>
 
              {/* Status */}
              <td style={{
                backgroundColor: orang.Aktif ? '#EAF3DE' : '#FCEBEB',
                color: orang.Aktif ? '#3B6D11' : '#ac2c2c',
                fontWeight: '500'
              }}>
                {editTarget === orang.id ? (
                  <select
                    ref={AktifRef}
                    value={editForm.Aktif}
                    onChange={e => setEditForm({...editForm, Aktif: e.target.value === 'true'})}
                    onBlur={() => {timeoutRef.current = setTimeout(simpanEdit, 200);}}
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Tidak Aktif</option>
                  </select>
                ) : (
                  <span onClick={() => bukaEdit(orang.id, 'Aktif')} style={{cursor: 'pointer'}}>
                    {orang.Aktif ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                )}
              </td>
 
              {/* Aksi */}
              <td style={{display: 'flex', gap: '6px'}}>
                <button
                  onClick={() => LihatDetail(orang)}
                  style={{backgroundColor: '#3B82F6', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer'}}
                >
                  👁 Lihat Detail
                </button>
                <button
                  onClick={() => hapusData(orang.id, orang.nama)}
                  style={{backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer'}}
                >
                  🗑 Hapus Data
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
function Nexthalaman(props){
  const {setHalaman,totalHalaman,halaman}=props;
    return(
   <div style={{display: 'flex',gap: '8px', marginTop: '1rem',alignItems: 'center',justifyContent:'center'}}>
        <button
        onClick={()=>setHalaman(h => h-1)}
        disabled={halaman ===1}
        style={{
          padding: '6px 14px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          background: halaman === 1 ? '#f3f4f6': 'white',
          cursor: halaman === 1 ? 'not-allowed': 'pointer',
          color: halaman === 1 ? '#9ca3af' : 'black'

        }}
        > ← Sebelumnya </button>
        {/* Nomor Halaman */}
        {Array.from ({length: totalHalaman}, (_, i)=>i+1).map(nomor=>(
          <button
          key={nomor}
          onClick={()=>setHalaman(nomor)}
          style={{
            padding: '6px 12px',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        background: halaman === nomor ? '#A490D9' : 'white',
        color: halaman === nomor ? 'white' : 'black',
        cursor: 'pointer',
        fontWeight: halaman === nomor ? 'bold' : 'normal'
          }}
          >{nomor}</button>
        ))}
        {/* Tombol Berikutnya */}
        <button
        onClick={()=>setHalaman(h =>h+1)}
        disabled={halaman === totalHalaman}
        style={{
          padding: '6px 14px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      background: halaman === totalHalaman ? '#f3f4f6' : 'white',
      cursor: halaman === totalHalaman ? 'not-allowed' : 'pointer',
      color: halaman === totalHalaman ? '#9ca3af' : 'black'
        }}
        >
          Berikutnya →
        </button>
</div>
)}
function Detail(props){
  const{detail,setDetail,orang}=props;
  return(
    // {/* Modal Detail */}
      detail && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999}}>
          <div style={{width: '360px', background: '#fff', borderRadius: '24px', padding: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px'}}>
              <div style={{width: '80px', height: '80px', borderRadius: '50%', background: '#3B82F6', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px', fontWeight: 'bold', marginBottom: '12px'}}>
                {detail.nama.charAt(0)}
              </div>
              <h2 style={{margin: 0, fontSize: '24px'}}>{detail.nama}</h2>
              <p style={{margin: '6px 0 0', color: '#666'}}>Detail Pengguna</p>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
              <div style={{background: '#f5f7fb', padding: '12px', borderRadius: '14px'}}><strong>Usia</strong><div>{detail.usia} Tahun</div></div>
              <div style={{background: '#f5f7fb', padding: '12px', borderRadius: '14px'}}><strong>Kota</strong><div>{detail.Kota}</div></div>
              <div style={{background: detail.Aktif ? '#EAF7EE' : '#FDECEC', padding: '12px', borderRadius: '14px'}}><strong>Status</strong><div>{detail.Aktif ? '🟢 Aktif' : '🔴 Tidak Aktif'}</div></div>
            </div>
            <button
              onClick={() => setDetail(null)}
              style={{width: '100%', marginTop: '22px', padding: '12px', border: 'none', borderRadius: '14px', background: '#111827', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer'}}
            >
              Tutup
            </button>
          </div>
        </div>
      )
      )}
function Modalkonfirmasi(props){
  const {konfirmasi,setKonfirmasi,konfirmasiHapus}= props;
  return(
      konfirmasi && (
        <div style={{
          position : 'fixed',inset:0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent:'center',
          zIndex:9999
        }}>
        <div style={{
          background: 'white',borderRadius: '16px',
          padding: '2rem', width: '320px', textAlign: 'center'
        }}>
        <div style={{
          width: '64px', height: '64px',
          borderRadius: '50%',
          background: '#FCEBEB',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
          fontSize: '28px'
        }}>
           🗑️
        </div>
        <p style={{fontSize: '18px', fontWeight: '600'}}>Hapus Data Pengguna?</p>
        <p style={{color: '#05050566', margin: '8px 0 20px'}}>
          Kamu Akan Menghapus <strong>"{konfirmasi.nama}"</strong> <br/>
          Tindakan Ini Tidak Bisa di Batalkan.
        </p>
        <div style={{display: 'flex', gap: '8px'}}>
          <button onClick={()=>setKonfirmasi(null)}
          style={{ flex: 1,padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer'}}>
            Batal
          </button>
          <button onClick={konfirmasiHapus}
          style={{flex: 1,padding: '10px', borderRadius: '8px', background: '#E24B4A',color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600'}}>
            🗑️Ya, Hapus
                </button>
        </div>
        </div>
        </div>
      )
      );
}


export default TabelPengguna;
