const express = require('express');
const MemberModel = require('../models/MemberModel');
const app = express()
const jwt = require('jsonwebtoken');
require('dotenv').config()
const service = require('./Service');


app.post('/member/memberRegister', async (req, res) => {
    try {
        // รับข้อมูลจากคำขอ
        const { name, phone, email, sex, pass } = req.body;

        // ตรวจสอบข้อมูลที่ได้รับ
        if (!name || !phone || !email || !sex || !pass) {
            return res.status(400).send({ message: 'ข้อมูลไม่ครบถ้วน' });
        }

        // ตรวจสอบหมายเลขโทรศัพท์ว่ามีอยู่ในฐานข้อมูลแล้วหรือไม่
        const existingMember = await MemberModel.findOne({ where: { phone: phone } });
        if (existingMember) {
            return res.status(400).send({ message: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' });
        }

        // บันทึกข้อมูลลงในฐานข้อมูล
        await MemberModel.create({
            name: name,
            phone: phone,
            email: email,
            sex: sex,
            pass: pass, // ใช้รหัสผ่านที่ไม่ได้เข้ารหัส
            role: 'user'  // ตั้งค่า role เป็น 'user' โดยค่าเริ่มต้น
        });

        // ส่งข้อความตอบสนองเมื่อบันทึกสำเร็จ
        res.send({ message: 'success' });

    } catch (e) {
        // ส่งข้อความตอบสนองเมื่อเกิดข้อผิดพลาด
        res.status(500).send({ message: e.message });
    }
});


app.post('/member/signin', async (req, res) => {
    try {
        const member = await MemberModel.findOne({
            where: {
                phone: req.body.phone,
                pass: req.body.pass,
                role: 'user' // Check if the role is 'user'
            }
        });

        if (member) {
            let token = jwt.sign({ id: member.id, role: 'user' }, process.env.secret);
            res.send({ token: token, message: 'success' });
        } else {
            res.statusCode = 401;
            res.send({ message: 'not found' });
        }

    } catch (e) {
        res.statusCode = 500;
        res.send({ message: e.message });
    }
});

app.post('/admin/signin',  async (req, res) => {
    try {
        const admin = await MemberModel.findOne({
            where: {
                phone: req.body.phone,
                pass: req.body.pass,
                role: 'admin' // Check if the role is 'admin'
            }
        });

        if (admin) {
            let token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.secret);
            res.send({ token: token, message: 'success' });
        } else {
            res.statusCode = 401;
            res.send({ message: 'not found' });
        }

    } catch (e) {
        res.statusCode = 500;
        res.send({ message: e.message });
    }
});

app.get('/member/info', service.isLogin, async (req, res) => {
    try {
        const payLoad = jwt.decode(service.getToken(req));
        
        // ค้นหาข้อมูลสมาชิกตาม ID
        const member = await MemberModel.findByPk(payLoad.id, {
            attributes: ['id', 'name', 'phone', 'address','sex'] // กำหนดฟิลด์ที่ต้องการส่งกลับ
        });
        
        // ตรวจสอบว่าพบสมาชิกหรือไม่
        if (!member) {
            return res.status(404).send({ message: 'Member not found' });
        }

        res.send({ result: member, message: 'success' });
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
});

//------------------------------------------------------------------------------api -> เปลี่ยนข้อมูลที่อยู่
app.put('/member/editAddress', service.isLogin, async (req, res) => {
    try {
        const memberId = service.getMemberId(req);
        const reasult = await MemberModel.update(req.body, {
            where : {
                id: memberId
            }
        });
        res.send({message: 'success',reasult: reasult})
    } catch (e) {
        res.statusCode = 500;
        res.send({ message: e.message });
    }
})
//------------------------------------------------------------------------------api -> เปลี่ยนข้อมูลที่อยู่

//------------------------------------------------------------------------------api -> เปลี่ยนข้อมูลเบอร์โทร
app.put('/member/editPhone', service.isLogin, async (req, res) => {
    try {
        const memberId = service.getMemberId(req);
        const reasult = await MemberModel.update(req.body, {
            where : {
                id: memberId
            }
        });
        res.send({message: 'success',reasult: reasult})
    } catch (e) {
        res.statusCode = 500;
        res.send({ message: e.message });
    }
})
//------------------------------------------------------------------------------api -> เปลี่ยนข้อมูลเบอร์โทร

//------------------------------------------------------------------------------api -> เปลี่ยนข้อมูลชื่อ
app.put('/member/editName', service.isLogin, async (req, res) => {
    try {
        const memberId = service.getMemberId(req);
        const reasult = await MemberModel.update(req.body, {
            where : {
                id: memberId
            }
        });
        res.send({message: 'success',reasult: reasult})
    } catch (e) {
        res.statusCode = 500;
        res.send({ message: e.message });
    }
})
//------------------------------------------------------------------------------api -> เปลี่ยนข้อมูลชื่อ

//------------------------------------------------------------------------------ส่ง id ไปให้ order
app.get('/member/info/id', service.isLogin, async (req, res) => {
    try {
        const payLoad = jwt.decode(service.getToken(req));
        const memberId = payLoad.id;
        res.send({ userId: memberId, message: 'success' }); // ส่งเฉพาะ ID ของสมาชิกกลับไป
    } catch (e) {
        res.statusCode = 500;
        return res.send({ message: e.message })
    }
});
//------------------------------------------------------------------------------ส่ง id ไปให้ order

//---------------------------------------------------------------------------------ดึงข้อมูลชื่อผู้ใช้ไปเเสดงหน้า Order
app.get('/member/info/:id', service.isLogin, async (req, res) => {
    try {
        const userId = req.params.id;
        const member = await MemberModel.findByPk(userId);

        if (!member) {
            res.statusCode = 404;
            return res.send({ message: 'User not found' });
        }

        // ส่งเฉพาะข้อมูลที่ต้องการ
        res.send({
            result: {
                name: member.name,
                address: member.address,
                phone: member.phone,
            },
            message: 'success'
        });
    } catch (e) {
        res.statusCode = 500;
        return res.send({ message: e.message });
    }
});
//---------------------------------------------------------------------------------ดึงข้อมูลชื่อผู้ใช้ไปเเสดงหน้า Order


//---------------------------------------------------------------------------------ดึงข้อมูลชื่อผู้ใช้ไปเเสดงหน้า adminOrder
app.get('/member/name/:id', service.isLogin, async (req, res) => {
    try {
        const userId = req.params.id;  // แก้ไขจาก req.params.userId เป็น req.params.id
        const member = await MemberModel.findByPk(userId);

        if (!member) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.send({ name: member.name, message: 'success' });
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
});
//----------------------------------------------------------------------------------ดึงข้อมูลชื่อผู้ใช้ไปเเสดงหน้า adminOrder


module.exports = app;