erDiagram
    login ||--|{ booking : "melakukan"
    mobil ||--|{ booking : "dipesan_pada"
    booking ||--|{ pembayaran : "memiliki"
    booking ||--|| pengembalian : "memiliki"

    login {
        int id_login PK
        string nama_pengguna
        string username
        string level
    }
    mobil {
        int id_mobil PK
        string no_plat
        string merk
        int harga
        string status
    }
    booking {
        int id_booking PK
        string kode_booking UK "Unique Key"
        int id_login FK
        int id_mobil FK
        string tanggal
        int lama_sewa
        int total_harga
    }
    pembayaran {
        int id_pembayaran PK
        int id_booking FK
        int nominal
        string tanggal
    }
    pengembalian {
        int id_pengembalian PK
        string kode_booking FK
        date tanggal
        int denda
    }
    infoweb {
        int id PK
        string nama_rental
        string telp
        string alamat
    }
