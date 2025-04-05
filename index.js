const express = require('express');
const mysql2 = require('mysql2');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const session = require('express-session'); // เพิ่ม session
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, '/public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(session({
    secret: 'secret-key', // เปลี่ยนเป็นคีย์ที่คุณต้องการ
    resave: false,
    saveUninitialized: true
}));

const connection = mysql2.createConnection({
    host: 'localhost',
    user: 'root',   
    password: '',
    database: 'user_authentication',
});

connection.connect((err) => {
    if (err) {
        return console.log('Error Connecting : ', err);
    }
    console.log('Connecting Successfully');
});

// ตั้งค่า storage สำหรับ Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');  // ตำแหน่งที่ต้องการเก็บไฟล์ที่อัปโหลด
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname;
        
        // ตรวจสอบว่าไฟล์นี้มีอยู่แล้วใน uploads หรือไม่
        const filePath = path.join('public/uploads', fileName);
        
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // ถ้าไฟล์ไม่มีในระบบ จะทำการตั้งชื่อไฟล์
                cb(null, fileName);
            } else {
                // ถ้าไฟล์มีแล้ว ก็ให้ใช้ไฟล์เดิม
                cb(null, fileName);
            }
        });
    }
});

// กำหนดขนาดไฟล์และประเภทไฟล์ที่อนุญาต
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // กำหนดขนาดไฟล์สูงสุด (5MB)
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;  // อนุญาตไฟล์ประเภทภาพ
        const extname = filetypes.test(file.mimetype);
        const basename = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (extname && basename) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
}).single('img');  // ชื่อฟิลด์ input ที่ใช้ในฟอร์ม (ต้องตรงกับชื่อใน HTML)


// home - ตรวจสอบการลงทะเบียน ( finished )
app.get('/', (req, res) => {
    res.render('login', { message: null });
});

app.post('/', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('login', { message: "กรุณากรอกอีเมลและรหัสผ่าน" });
    }

    // ค้นหาข้อมูลผู้ใช้จากฐานข้อมูล
    connection.query("SELECT * FROM login WHERE Email = ? AND Password = ?", [email, password], (err, results) => {
        if (err) {
            console.log("Error checking login credentials: ", err);
            return res.status(500).send("Internal server error");
        }

        // ถ้าไม่พบผู้ใช้ (ไม่ตรงกับข้อมูลที่กรอก)
        if (results.length === 0) {
            return res.render('login', { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
        }

        // ถ้าพบข้อมูลผู้ใช้
        req.session.email = email;  // ใช้ session เพื่อเก็บข้อมูลอีเมล
        res.redirect('/type');  // ไปยังหน้า type หลังจากเข้าสู่ระบบสำเร็จ
    });
});

// Register ( finished )
app.get('/register', (req, res) => {
    res.render('info', { message: null });
});

app.post('/register', upload, (req, res) => {
    const { email, password, nickname, faculty, major, mbti, facebook, instagram,twitter ,subject,sect} = req.body;
    const img = req.file ? req.file.filename : null;  // ใช้ชื่อไฟล์ที่อัปโหลด
    console.log(req.body);

    // ตรวจสอบว่าผู้ใช้กรอกข้อมูลครบถ้วนหรือไม่
    if (!email || !password || !nickname || !faculty || !major || !mbti || !facebook || !instagram || !twitter || !subject || !sect || !img) {
        return res.render('info', { message: "ใส่ข้อมูลให้ครบถ้วน" });
    }

    // เช็คว่าอีเมลซ้ำในฐานข้อมูลหรือไม่
    connection.query("SELECT * FROM login WHERE Email = ?", [email], (err, results) => {
        if (err) {
            console.log("Error Checking Email: ", err);
            return res.status(500).send("Internal server error");
        }

        if (results.length > 0) { // ถ้ามีข้อมูลอีเมลซ้ำ
            return res.render('info', { message: "อีเมลนี้ถูกใช้งานแล้ว กรุณาลองใหม่อีกครั้ง" });
        }

        // ถ้าไม่ซ้ำ ก็ทำการลงทะเบียนข้อมูล
        connection.query(
            "INSERT INTO login (Email, Password, Name, Faculty, Major, MBTI, Facebook, Instagram, Twitter,subject,sect,img) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)",
            [email, password, nickname, faculty, major, mbti, facebook, instagram, twitter ,subject,sect,img],
            (err, results) => {
                if (err) {
                    console.log("Error inserting data: ", err);
                    return res.status(500).send("Internal server error");
                }
                res.render('login', { message: "Register Successfully" });
            }
        );
    });
});

// Type ( unfinished ) 
app.get('/type', (req, res) => {
    res.render('type',{message:null})
});
app.get('/findStudy',(req,res)=>{
    res.render('findStudy',{message : null})

})

app.get('/match',(req,res)=>{
    res.render('match',{mesaage : null,user : []})

})
app.post('/match', (req, res) => {
    const { subject, sect } = req.body;  // ดึงข้อมูลจากฟอร์ม
    console.log(req.body)
    if (!subject || !sect) {
        return res.render('match', { message: "กรุณาเลือกวิชาและหมวด", users: [] });
    }

    connection.query(
        "SELECT * FROM login WHERE subject = ? AND sect = ?",
        [subject, sect],
        (err, results) => {
            if (err) {
                console.log("Error fetching data: ", err);
                return res.status(500).send("Internal server error");
            }

            if (results.length === 0) {
                return res.render('match', { message: "ไม่พบผู้ที่ตรงกับข้อมูลที่เลือก", users: [] });
            }

            // ถ้ามีข้อมูลผู้ที่ตรงกับวิชาและหมวด
            res.render('match', { message: "พบผู้ที่ตรงกับข้อมูลที่เลือก", users: results });
        }
    );
});

app.get('/matchPlay', (req, res) => {
    const query = "SELECT * FROM login ";

    connection.query(query, (err, results) => {
        if (err) {
            console.log("Error fetching data: ", err);
            return res.status(500).send("Internal server error");
        }
        console.log(results)
        res.render('matchPlay', { message: "พบผู้ใช้", users: results });
    });
});


// ดึงข้อมูลโปรไฟล์ผู้ใช้ ( Demo Only )
app.get('/profile/:email', (req, res) => {
    const email = req.params.email;

    connection.query("SELECT * FROM login WHERE Email = ?", [email], (err, results) => {
        if (err) {
            console.log("Error fetching user profile: ", err);
            return res.status(500).send("Internal server error");
        }

        if (results.length > 0) {
            const user = results[0];
            const profileImage = user.img ? `/uploads/${user.img}` : null;  // ใช้ชื่อไฟล์ที่เก็บในฐานข้อมูล
            res.render('profile', { user, profileImage });
        } else {
            res.render('login', { message: "ไม่พบผู้ใช้" });
        }
    });
});

app.listen(8200, 'localhost', (req, res) => {
    console.log('Started on Port 8080');
});
