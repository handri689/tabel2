import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function HalamanAbsensi() {
    const { id } = useParams(); // ✅ ambil id dari URL
    const [siswa, setSiswa] = useState(null);
    const [tanggal, setTanggal] = useState('');
    const [status, setStatus] = useState('hadir');
    const [loading, setLoading] = useState(false);
    const [sukses, setSukses] = useState('');
    const navigate = useNavigate();

    // Ambil data siswa berdasarkan id
    useEffect(() => {
        const ambilSiswa = async () => {
            const { data } = await supabase
                .from('pengguna')
                .select('*')
                .eq('id', Number(id))
                .single();
            setSiswa(data);
        };
        ambilSiswa();
    }, [id]);

    const simpan = async () => {
        if (!tanggal) {
            alert('Pilih tanggal dulu!');
            return;
        }
        setLoading(true);

        const { error } = await supabase
            .from('absensi')
            .upsert({
                siswa_id: Number(id),
                tanggal: tanggal,
                status: status,
            }, { onConflict: 'siswa_id,tanggal' });

        if (error) {
            alert('Gagal menyimpan: ' + error.message);
        } else {
            setSukses('Absensi berhasil disimpan!');
            setTimeout(() => setSukses(''), 3000);
            navigate('/Login')
        }
        setLoading(false);
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-2">Input Absensi</h1>
            {siswa && (
                <p className="text-gray-600 mb-4">Siswa: <strong>{siswa.nama}</strong></p>
            )}

            <div className="mb-4">
                <label className="block mb-1 font-semibold">Tanggal</label>
                <input
                    type="date"
                    value={tanggal}
                    onChange={e => setTanggal(e.target.value)}
                    className="border p-2 rounded w-full"
                />
            </div>

            <div className="mb-4">
                <label className="block mb-1 font-semibold">Status</label>
                <div className="flex gap-3">
                    {['hadir', 'izin', 'sakit', 'alpha'].map(s => (
                        <label key={s} className="flex items-center gap-1 capitalize cursor-pointer">
                            <input
                                type="radio"
                                name="status"
                                value={s}
                                checked={status === s}
                                onChange={() => setStatus(s)}
                            />
                            {s}
                        </label>
                    ))}
                </div>
            </div>

            <button
                onClick={simpan}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full"
            >
                {loading ? 'Menyimpan...' : 'Simpan Absensi'}
            </button>

            {sukses && <p className="mt-3 text-green-600 font-semibold">{sukses}</p>}
        </div>
    );
}

export default HalamanAbsensi;