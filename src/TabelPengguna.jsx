import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './supabase';
import jsPDF from 'jspdf';
import { useNavigate, useLocation } from 'react-router-dom';

// ============================================================
// KOMPONEN UTAMA
// ============================================================
function TabelPengguna() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ state data — awalnya kosong, diisi dari Supabase
  const [data, setData] = useState([]);

  // ✅ fungsi ambil data dari Supabase
  const ambilData = async () => {
    const { data, error } = await supabase
      .from('pengguna')
      .select('*');
    if (error) console.log('Error:', error);
    else setData(data);
  };

  // ✅ jalankan ambilData saat pertama kali halaman dibuka
  useEffect(() => {
    ambilData();
  }, []);

  // ✅ tampilkan notifikasi dari halaman tambah & refresh data
  useEffect(() => {
    if (location.state?.pesan) {
      tampilNotif(location.state.pesan, location.state.warna);
      navigate('.', { replace: true, state: {} });
      ambilData(); // refresh tabel setelah tambah data
    }
  }, []);

  // menyimpan data orang yang akan dihapus
  const [konfirmasi, setKonfirmasi] = useState(null);
  const hapusData = (id, nama) => setKonfirmasi({ id, nama });

  // ✅ hapus data dari Supabase
  const konfirmasiHapus = async () => {
    const { error } = await supabase
      .from('pengguna')
      .delete()
      .eq('id', konfirmasi.id);

    if (!error) {
      setData(data.filter(o => o.id !== konfirmasi.id));
      tampilNotif('🗑 Data Berhasil Dihapus!', 'merah');
    }
    setKonfirmasi(null);
  };

  // notifikasi
  const [notif, setNotif] = useState(null);
  const warnaNotif = {
    hijau: 'bg-green-500',
    merah: 'bg-red-500',
    biru:  'bg-blue-500',
  };
  const tampilNotif = (pesan, warna = 'hijau') => {
    setNotif({ pesan, warna });
    setTimeout(() => setNotif(null), 3000);
  };

  // filter & search
  const [filter, setFilter]         = useState('semua');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]           = useState('');

  const dataFiltered = data.filter(orang => {
    const cocokFilter =
      filter === 'aktif' ? orang.Aktif === true :
      filter === 'tidak' ? orang.Aktif === false :
      true;
    const cocokSearch =
      orang.nama.toLowerCase().includes(search.toLowerCase()) ||
      orang.Kota.toLowerCase().includes(search.toLowerCase()) ||
      orang.usia.toString().includes(search);
    return cocokFilter && cocokSearch;
  });

  // pagination
  const [halaman, setHalaman] = useState(1);
  const dataPerHalaman = 5;
  const totalHalaman   = Math.ceil(dataFiltered.length / dataPerHalaman);
  const dataHalaman    = dataFiltered.slice(
    (halaman - 1) * dataPerHalaman,
    halaman * dataPerHalaman
  );

  // edit inline
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm]     = useState({ nama: '', usia: '', Kota: '', Aktif: true });
  const [editKolom, seteditKolom]   = useState(null);
  const editTargetRef = useRef(null);
  const editFormRef   = useRef(editForm);
  const timeoutRef    = useRef(null);
  const namaRef       = useRef(null);
  const usiaRef       = useRef(null);
  const KotaRef       = useRef(null);
  const AktifRef      = useRef(null);

  // statistik
  const totalData        = data.length;
  const totalAktif       = data.filter(o => o.Aktif === true).length;
  const totoalTidakAktif = data.filter(o => o.Aktif === false).length;

  useEffect(() => {
    editFormRef.current = editForm;
  }, [editForm]);

  useEffect(() => {
    if (editKolom === 'nama'  && namaRef.current)  namaRef.current.focus();
    if (editKolom === 'usia'  && usiaRef.current)  usiaRef.current.focus();
    if (editKolom === 'Kota'  && KotaRef.current)  KotaRef.current.focus();
    if (editKolom === 'Aktif' && AktifRef.current) AktifRef.current.focus();
  }, [editKolom, editTarget]);

  const bukaEdit = (id, Kolom) => {
    clearTimeout(timeoutRef.current);
    editTargetRef.current = id;
    setEditTarget(id);
    seteditKolom(Kolom);
    const orang = data.find(o => o.id === id);
    setEditForm({ nama: orang.nama, usia: orang.usia, Kota: orang.Kota, Aktif: orang.Aktif });
  };

  const [darkMode, setDarkMode] = useState(false);

  // ✅ simpan edit ke Supabase
  const simpanEdit = async () => {
    const idTarget = editTargetRef.current;
    const formSaat = editFormRef.current;
    if (!idTarget) return;

    const { error } = await supabase
      .from('pengguna')
      .update({
        nama: formSaat.nama,
        usia: Number(formSaat.usia),
        Kota: formSaat.Kota,
        Aktif: formSaat.Aktif,
      })
      .eq('id', idTarget);

    if (!error) {
      setData(prev => prev.map(o =>
        o.id === idTarget ? { ...o, ...formSaat, usia: Number(formSaat.usia) } : o
      ));
      tampilNotif('✏️ Data Berhasil diupdate!', 'biru');
    }
    setEditTarget(null);
    editTargetRef.current = null;
  };

  // export CSV
  const exportCSV = () => {
    const header = ['ID', 'NAMA', 'USIA', 'KOTA', 'STATUS'];
    const baris  = data.map(o => [o.id, o.nama, o.usia, o.Kota, o.Aktif ? 'Aktif' : 'Tidak Aktif']);
    const isiCSV = [header, ...baris].map(b => b.join(',')).join('\n');
    const blob   = new Blob([isiCSV], { type: 'text/csv' });
    const url    = URL.createObjectURL(blob);
    const link   = document.createElement('a');
    link.href     = url;
    link.download = 'data-pengguna.csv';
    link.click();
    URL.revokeObjectURL(url);
    tampilNotif('📥 Data berhasil diexport', 'hijau');
  };

  // export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Daftar Pengguna', 14, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ID',     14,  30);
    doc.text('Nama',   25,  30);
    doc.text('Usia',   95,  30);
    doc.text('Kota',   115, 30);
    doc.text('Status', 155, 30);
    doc.line(14, 32, 196, 32);
    doc.setFont('helvetica', 'normal');
    data.forEach((o, i) => {
      const y = 40 + (i * 10);
      doc.text(String(o.id),                       14,  y);
      doc.text(o.nama,                             25,  y);
      doc.text(String(o.usia),                     95,  y);
      doc.text(o.Kota,                             115, y);
      doc.text(o.Aktif ? 'Aktif' : 'Tidak Aktif', 155, y);
    });
    doc.save('data-pengguna.pdf');
    tampilNotif('📄 Data berhasil diexport ke PDF!', 'biru');
  };

  return (
    <div className={`min-h-screen bg-fixed p-5 transition-all duration-300 ${
      darkMode
        ? 'bg-linear-to-br from-indigo-950 via-purple-950 to-violet-950'
        : 'bg-linear-to-br from-white via-purple-50 to-white'
    }`}>

      {/* NOTIFIKASI */}
      {notif && (
        <div className={`fixed top-5 right-5 px-5 py-3.5 rounded-xl text-white font-semibold text-sm z-50 shadow-lg transition-all duration-300 ${warnaNotif[notif.warna]}`}>
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

      <Statistik
        totalData={totalData}
        totalAktif={totalAktif}
        totoalTidakAktif={totoalTidakAktif}
      />

      <Tabel
        editForm={editForm} setEditForm={setEditForm}
        bukaEdit={bukaEdit} hapusData={hapusData}
        darkMode={darkMode} dataHalaman={dataHalaman}
        editTarget={editTarget}
        namaRef={namaRef} usiaRef={usiaRef}
        KotaRef={KotaRef} AktifRef={AktifRef}
        timeoutRef={timeoutRef} simpanEdit={simpanEdit}
      />

      <Nexthalaman
        halaman={halaman}
        totalHalaman={totalHalaman}
        setHalaman={setHalaman}
      />

      <Modalkonfirmasi
        konfirmasi={konfirmasi}
        setKonfirmasi={setKonfirmasi}
        konfirmasiHapus={konfirmasiHapus}
      />

      <div className="text-center mt-2 text-green-400 text-xs">
        Halaman {halaman} dari {totalHalaman} - Total {dataFiltered.length} data
      </div>

    </div>
  );
}

// ============================================================
// KOMPONEN SEARCH
// ============================================================
function Search(props) {
  const navigate = useNavigate();
  const { filter, setFilter, searchInput, setSearchInput,
    search, setSearch, darkMode, setDarkMode,
    exportCSV, exportPDF } = props;

  return (
    <div className="flex gap-2 mb-4 items-center flex-wrap p-2">
      {[
        { label: 'Semua',       value: 'semua' },
        { label: 'Aktif',       value: 'aktif' },
        { label: 'Tidak Aktif', value: 'tidak' },
      ].map(btn => (
        <button
          key={btn.value}
          onClick={() => setFilter(btn.value)}
          className={`px-4 py-1.5 rounded-lg border font-medium text-sm transition-colors ${
            filter === btn.value
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {btn.label}
        </button>
      ))}

      <input
        placeholder="Cari Kota/nama/usia..."
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-400"
      />

      <button
        onClick={() => setSearch(searchInput)}
        className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
      >
        🔍 Search
      </button>

      {search && (
        <button
          onClick={() => { setSearch(''); setSearchInput(''); }}
          className="px-3 py-1.5 bg-gray-200 rounded-lg text-sm hover:bg-gray-300 transition-colors"
        >
          ✕ Reset
        </button>
      )}

      <button
        onClick={() => navigate('/tambah')}
        className="px-4 py-1.5 bg-violet-500 text-white rounded-lg text-sm font-semibold hover:bg-violet-600 transition-colors"
      >
        + Tambah Data
      </button>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`px-3 py-1.5 rounded-lg text-sm font-semibold ml-auto transition-colors ${
          darkMode
            ? 'bg-yellow-400 text-indigo-900 hover:bg-yellow-300'
            : 'bg-indigo-900 text-white hover:bg-indigo-800'
        }`}
      >
        {darkMode ? '☀️ Light' : '🌙 Dark'}
      </button>

      <button onClick={exportCSV} className="px-4 py-1.5 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors">
        📥 Export CSV
      </button>

      <button onClick={exportPDF} className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
        📄 Export PDF
      </button>
    </div>
  );
}

// ============================================================
// KOMPONEN STATISTIK
// ============================================================
function Statistik({ totalData, totalAktif, totoalTidakAktif }) {
  return (
    <div className="flex gap-3 mb-4 justify-end">
      <div className="bg-pink-800 border border-gray-100 rounded-xl px-5 py-3 text-center min-w-24">
        <div className="text-3xl font-bold text-gray-900">{totalData}</div>
        <div className="text-xs text-gray-800">Total Data</div>
      </div>
      <div className="bg-yellow-900 border border-green-400 rounded-xl px-5 py-3 text-center min-w-24">
        <div className="text-3xl font-bold text-green-400">{totalAktif}</div>
        <div className="text-xs text-blue-400">AKTIF</div>
      </div>
      <div className="bg-cyan-300 border border-red-200 rounded-xl px-5 py-3 text-center min-w-24">
        <div className="text-3xl font-bold text-red-500">{totoalTidakAktif}</div>
        <div className="text-xs text-gray-500">Tidak Aktif</div>
      </div>
    </div>
  );
}

// ============================================================
// KOMPONEN TABEL
// ============================================================
function Tabel(props) {
  const navigate = useNavigate();
  const { editForm, setEditForm, bukaEdit, hapusData,
    darkMode, dataHalaman, editTarget,
    namaRef, usiaRef, KotaRef, AktifRef,
    timeoutRef, simpanEdit } = props;

  const inputClass = "border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-purple-400 w-full";

  return (
    <div className="overflow-x-auto rounded-xl shadow">
      <table className="w-full border-collapse text-sm">
        <thead className={darkMode ? 'bg-blue-950 text-white' : 'bg-black text-white'}>
          <tr className="text-left">
            <th className="px-3 py-2 w-10 border border-gray-300">NO</th>
            <th className="px-3 py-2 w-30 border border-gray-300">NAMA</th>
            <th className="px-3 py-2 w-16 border border-gray-300">USIA</th>
            <th className="px-3 py-2 w-30 border border-gray-300">KOTA</th>
            <th className="px-3 py-2 w-28 border border-gray-300">STATUS</th>
            <th className="px-3 py-2 w-30 border border-gray-300 text-center">AKSI</th>
          </tr>
        </thead>
        <tbody>
          {dataHalaman.map((orang, index) => (
            <tr key={orang.id} className="border-b border-gray-200 hover:bg-purple-50 transition-colors text-left">

              <td className="px-3 py-2 border border-gray-300">{index + 1}</td>

              <td className="px-3 py-2 border border-gray-300">
                {editTarget === orang.id ? (
                  <input ref={namaRef} value={editForm.nama}
                    onChange={e => setEditForm({ ...editForm, nama: e.target.value })}
                    onBlur={() => { timeoutRef.current = setTimeout(simpanEdit, 200); }}
                    className={inputClass} />
                ) : (
                  <span onClick={() => bukaEdit(orang.id, 'nama')} className="cursor-pointer hover:text-purple-600">
                    {orang.nama}
                  </span>
                )}
              </td>

              <td className="px-3 py-2 border border-gray-300">
                {editTarget === orang.id ? (
                  <input ref={usiaRef} type="number" value={editForm.usia}
                    onChange={e => setEditForm({ ...editForm, usia: e.target.value })}
                    onBlur={() => { timeoutRef.current = setTimeout(simpanEdit, 200); }}
                    className={`${inputClass} w-16`} />
                ) : (
                  <span onClick={() => bukaEdit(orang.id, 'usia')} className="cursor-pointer hover:text-purple-600">
                    {orang.usia}
                  </span>
                )}
              </td>

              <td className="px-3 py-2 border border-gray-300">
                {editTarget === orang.id ? (
                  <input ref={KotaRef} value={editForm.Kota}
                    onChange={e => setEditForm({ ...editForm, Kota: e.target.value })}
                    onBlur={() => { timeoutRef.current = setTimeout(simpanEdit, 200); }}
                    className={inputClass} />
                ) : (
                  <span onClick={() => bukaEdit(orang.id, 'Kota')} className="cursor-pointer hover:text-purple-600">
                    {orang.Kota}
                  </span>
                )}
              </td>

              <td className={`px-3 py-2 border border-gray-300 font-medium ${orang.Aktif ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {editTarget === orang.id ? (
                  <select ref={AktifRef} value={editForm.Aktif}
                    onChange={e => setEditForm({ ...editForm, Aktif: e.target.value === 'true' })}
                    onBlur={() => { timeoutRef.current = setTimeout(simpanEdit, 200); }}
                    className={inputClass}>
                    <option value="true">Aktif</option>
                    <option value="false">Tidak Aktif</option>
                  </select>
                ) : (
                  <span onClick={() => bukaEdit(orang.id, 'Aktif')} className="cursor-pointer">
                    {orang.Aktif ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                )}
              </td>

              <td className="px-3 py-2 border border-gray-300">
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => navigate(`/detail/${orang.id}`)}
                    className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors"
                  >
                    👁 Detail
                  </button>
                  <button
                    onClick={() => hapusData(orang.id, orang.nama)}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
                  >
                    🗑 Hapus
                  </button>
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// KOMPONEN PAGINATION
// ============================================================
function Nexthalaman({ halaman, totalHalaman, setHalaman }) {
  return (
    <div className="flex gap-2 mt-4 items-center justify-center">
      <button
        onClick={() => setHalaman(h => h - 1)}
        disabled={halaman === 1}
        className={`px-4 py-1.5 rounded-lg border text-sm transition-colors ${
          halaman === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
            : 'bg-white text-black border-gray-300 hover:bg-gray-50 cursor-pointer'
        }`}
      >
        ← Sebelumnya
      </button>

      {Array.from({ length: totalHalaman }, (_, i) => i + 1).map(nomor => (
        <button key={nomor} onClick={() => setHalaman(nomor)}
          className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
            halaman === nomor
              ? 'bg-purple-500 text-white border-purple-500 font-bold'
              : 'bg-white text-black border-gray-300 hover:bg-gray-50'
          }`}
        >
          {nomor}
        </button>
      ))}

      <button
        onClick={() => setHalaman(h => h + 1)}
        disabled={halaman === totalHalaman}
        className={`px-4 py-1.5 rounded-lg border text-sm transition-colors ${
          halaman === totalHalaman
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
            : 'bg-white text-black border-gray-300 hover:bg-gray-50 cursor-pointer'
        }`}
      >
        Berikutnya →
      </button>
    </div>
  );
}

// ============================================================
// KOMPONEN MODAL KONFIRMASI HAPUS
// ============================================================
function Modalkonfirmasi({ konfirmasi, setKonfirmasi, konfirmasiHapus }) {
  return (
    konfirmasi && (
      <div className="fixed inset-0 bg-black bg-opacity-45 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-80 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-3xl">
            🗑️
          </div>
          <p className="text-lg font-semibold mb-2">Hapus Data Pengguna?</p>
          <p className="text-gray-500 text-sm mb-5">
            Kamu akan menghapus <strong>"{konfirmasi.nama}"</strong><br />
            Tindakan ini tidak bisa dibatalkan.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setKonfirmasi(null)}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button onClick={konfirmasiHapus}
              className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
              🗑️ Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    )
  );
}

export default TabelPengguna;