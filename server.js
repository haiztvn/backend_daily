const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Xử lý JSON từ body request

// Kết nối cơ sở dữ liệu (dùng connection pool)
const db = mysql.createPool({
    host: 'gamehay.id.vn',
    user: 'ndbdxcjw_dailydictation', // User mặc định
    password: 'aGaVusKrJeDuREYuKDy3', // Mật khẩu mặc định
    database: 'ndbdxcjw_dailydictation', // Thay bằng tên database của bạn
});

// Kiểm tra kết nối cơ sở dữ liệu
db.getConnection((err, connection) => {
    if (err) {
        console.error('Không thể kết nối đến cơ sở dữ liệu:', err.message);
        return;
    }
    console.log('Kết nối đến cơ sở dữ liệu thành công!');
    connection.release(); // Giải phóng kết nối sau khi kiểm tra
});

// API lấy danh sách dữ liệu Topics
app.get('/api/topics', (req, res) => {
    const sql = 'SELECT * FROM topics'; // Thay bằng tên bảng của bạn
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Lỗi khi truy vấn:', err.message);
            res.status(500).json({ error: 'Không thể lấy dữ liệu từ cơ sở dữ liệu' });
            return;
        }
        res.json(result);
    });
});


// Sử dụng middleware của multer
// API để thêm topic vào MySQL
app.post("/api/topics", (req, res) => {
    const { name, level, description } = req.body;

    // Kiểm tra nếu dữ liệu không đầy đủ
    if (!name || !level || !description) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Câu lệnh SQL để thêm topic vào cơ sở dữ liệu
    const sql = "INSERT INTO topics (name, level, description) VALUES (?, ?, ?)";

    db.query(sql, [name, level, description], (err, result) => {
        if (err) {
            console.error("Lỗi khi thêm topic:", err);
            return res.status(500).json({ error: "Database error" });
        }
        // Gửi phản hồi khi thêm thành công
        res.json({ message: "Topic added successfully!", topic_id: result.insertId });
    });
});

// Xóa dữ liệu
// Xử lý yêu cầu DELETE để xóa một bản ghi trong bảng topics
app.delete('/api/topics/:id', (req, res) => {
    const { id } = req.params; // Lấy ID từ tham số URL

    // Câu lệnh SQL để xóa dữ liệu trong cơ sở dữ liệu
    const query = 'DELETE FROM topics WHERE topic_id = ?';

    // Thực thi câu lệnh SQL
    db.execute(query, [id], (err, result) => {
        if (err) {
            // Nếu có lỗi trong quá trình thực thi câu lệnh SQL
            return res.status(500).json({ error: 'Unable to delete the topic', details: err });
        }

        // Kiểm tra nếu không có bản ghi nào bị xóa (không tìm thấy ID tương ứng)
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'topic not found' });
        }

        // Trả về phản hồi thành công nếu xóa thành công
        res.status(200).json({
            message: 'english_expressions deleted successfully',
            deletedCount: result.affectedRows, // Số bản ghi đã bị xóa
        });
    });
});

// APi update
app.put('/api/topics/:id', (req, res) => {
    const { id } = req.params; // Get the ID from URL
    const { name, level, description } = req.body; // Get the updated data from the request body

    // Check if all required fields are provided
    if (!name || !level || !description) {
        return res.status(400).json({ error: 'All fields (name, level, description) are required' });
    }

    // SQL query to update the topic in the database
    const query = 'UPDATE topics SET name = ?, level = ?, description = ? WHERE topic_id = ?';

    // Execute the query
    db.execute(query, [name, level, description, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to update the topic', details: err });
        }

        // If no rows are affected, return a message indicating no update was made
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        // Success response
        res.status(200).json({
            message: 'Topic updated successfully',
            updatedCount: result.affectedRows, // The number of rows updated
        });
    });
});


//english_expressions

// API lấy danh sách dữ liệu english_expressions
app.get('/api/english_expressions', (req, res) => {
    const sql = 'SELECT * FROM english_expressions'; // Thay bằng tên bảng của bạn
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Lỗi khi truy vấn:', err.message);
            res.status(500).json({ error: 'Không thể lấy dữ liệu từ cơ sở dữ liệu' });
            return;
        }
        res.json(result);
    });
});

// API để thêm dữ liệu vào MySQL
app.post("/api/english_expressions", (req, res) => {
    const { express_name, video_file } = req.body;

    // Kiểm tra nếu dữ liệu không đầy đủ
    if (!express_name || !video_file) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Câu lệnh SQL để thêm topic vào cơ sở dữ liệu
    const sql = "INSERT INTO english_expressions (express_name, video_file) VALUES (?, ?)";

    db.query(sql, [express_name, video_file], (err, result) => {
        if (err) {
            console.error("Lỗi khi thêm topic:", err);
            return res.status(500).json({ error: "Database error" });
        }
        // Gửi phản hồi khi thêm thành công
        res.json({ message: "english_expressions added successfully!", id_express: result.insertId });
    });
});

// Xóa dữ liệu

app.delete('/api/english_expressions/:id', (req, res) => {
    const { id } = req.params; // Lấy ID từ tham số URL

    // Câu lệnh SQL để xóa dữ liệu trong cơ sở dữ liệu
    const query = 'DELETE FROM english_expressions WHERE id_express = ?';

    // Thực thi câu lệnh SQL
    db.execute(query, [id], (err, result) => {
        if (err) {
            // Nếu có lỗi trong quá trình thực thi câu lệnh SQL
            return res.status(500).json({ error: 'Unable to delete the english_expressions', details: err });
        }

        // Kiểm tra nếu không có bản ghi nào bị xóa (không tìm thấy ID tương ứng)
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'english_expressions not found' });
        }

        // Trả về phản hồi thành công nếu xóa thành công
        res.status(200).json({
            message: 'english_expressions deleted successfully',
            deletedCount: result.affectedRows, // Số bản ghi đã bị xóa
        });
    });
});

// Api update dữ liệu
app.put('/api/english_expressions/:id', (req, res) => {
    const { id } = req.params; // Get the ID from URL
    const { express_name, video_file } = req.body; // Get the updated data from the request body

    // Check if all required fields are provided
    if (!express_name || !video_file) {
        return res.status(400).json({ error: 'All fields (express_name, video_file) are required' });
    }

    // SQL query to update the topic in the database
    const query = 'UPDATE english_expressions SET express_name = ?, video_file = ? WHERE id_express = ?';

    // Execute the query
    db.execute(query, [express_name, video_file, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to update the english_expressions ', details: err });
        }

        // If no rows are affected, return a message indicating no update was made
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'english_expressions not found' });
        }

        // Success response
        res.status(200).json({
            message: 'english_expressions updated successfully',
            updatedCount: result.affectedRows, // The number of rows updated
        });
    });
});


//exercises

// API lấy danh sách dữ liệu english_expressions
app.get('/api/exercises', (req, res) => {
    const sql = 'SELECT * FROM exercises'; // Thay bằng tên bảng của bạn
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Lỗi khi truy vấn:', err.message);
            res.status(500).json({ error: 'Không thể lấy dữ liệu từ cơ sở dữ liệu' });
            return;
        }
        res.json(result);
    });
});

app.get("/api/exercise-segments/:exercise_id", (req, res) => {
    const exerciseId = req.params.exercise_id;
    const query = "SELECT * FROM exercise_segments WHERE exercise_id = ?";
    db.query(query, [exerciseId], (err, results) => {
        if (err) {
            console.error("Error fetching segments:", err);
            res.status(500).send("Error fetching segments.");
        } else {
            res.json(results);
        }
    });
});
// API để thêm dữ liệu vào MySQL
app.post("/api/exercises", (req, res) => {
    const { topic_id, title } = req.body;

    // Kiểm tra nếu dữ liệu không đầy đủ
    if (!topic_id || !title) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Câu lệnh SQL để thêm topic vào cơ sở dữ liệu
    const sql = "INSERT INTO exercises (topic_id, title) VALUES (?, ?)";

    db.query(sql, [topic_id, title], (err, result) => {
        if (err) {
            console.error("Lỗi khi thêm exercises:", err);
            return res.status(500).json({ error: "Database error" });
        }
        // Gửi phản hồi khi thêm thành công
        res.json({ message: "exercises added successfully!", exercise_id: result.insertId });
    });
});
app.get("/api/exercises/:topic_id", (req, res) => {
    const topicId = req.params.topic_id;
    const query = "SELECT * FROM exercises WHERE topic_id = ?";
    db.query(query, [topicId], (err, results) => {
        if (err) {
            console.error("Error fetching exercises:", err);
            res.status(500).send("Error fetching exercises.");
        } else {
            res.json(results);
        }
    });
});
// Xóa dữ liệu

app.delete('/api/exercises/:id', (req, res) => {
    const { id } = req.params; // Lấy ID từ tham số URL

    // Câu lệnh SQL để xóa dữ liệu trong cơ sở dữ liệu
    const query = 'DELETE FROM exercises WHERE exercise_id = ?';

    // Thực thi câu lệnh SQL
    db.execute(query, [id], (err, result) => {
        if (err) {
            // Nếu có lỗi trong quá trình thực thi câu lệnh SQL
            return res.status(500).json({ error: 'Unable to delete the exercises', details: err });
        }

        // Kiểm tra nếu không có bản ghi nào bị xóa (không tìm thấy ID tương ứng)
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'exercises not found' });
        }

        // Trả về phản hồi thành công nếu xóa thành công
        res.status(200).json({
            message: 'exercises deleted successfully',
            deletedCount: result.affectedRows, // Số bản ghi đã bị xóa
        });
    });
});

// Api update dữ liệu
app.put('/api/exercises/:id', (req, res) => {
    const { id } = req.params; // Get the ID from URL
    const { topic_id, title } = req.body; // Get the updated data from the request body

    // Check if all required fields are provided
    if (!topic_id || !title) {
        return res.status(400).json({ error: 'All fields (topic_id, title ) are required' });
    }

    // SQL query to update the topic in the database
    const query = 'UPDATE exercises SET topic_id = ?, title = ? WHERE exercise_id = ?';

    // Execute the query
    db.execute(query, [topic_id, title, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to update the exercises ', details: err });
        }

        // If no rows are affected, return a message indicating no update was made
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'exercises not found' });
        }

        // Success response
        res.status(200).json({
            message: 'exercises updated successfully',
            updatedCount: result.affectedRows, // The number of rows updated
        });
    });
});

//learn_together

// API lấy danh sách dữ liệu english_expressions
app.get('/api/learn_together', (req, res) => {
    const sql = 'SELECT * FROM learn_together'; // Thay bằng tên bảng của bạn
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Lỗi khi truy vấn:', err.message);
            res.status(500).json({ error: 'Không thể lấy dữ liệu từ cơ sở dữ liệu' });
            return;
        }
        res.json(result);
    });
});
// API để thêm dữ liệu vào MySQL
app.post("/api/learn_together", (req, res) => {
    const { title_name, learn_link, language } = req.body;

    // Kiểm tra nếu dữ liệu không đầy đủ
    if (!title_name || !learn_link || !language) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Câu lệnh SQL để thêm topic vào cơ sở dữ liệu
    const sql = "INSERT INTO learn_together (title_name, learn_link, language) VALUES (?, ?, ?)";

    db.query(sql, [title_name, learn_link, language], (err, result) => {
        if (err) {
            console.error("Lỗi khi thêm learn_together:", err);
            return res.status(500).json({ error: "Database error" });
        }
        // Gửi phản hồi khi thêm thành công
        res.json({ message: "learn_together added successfully!", id_learn: result.insertId });
    });
});

// Xóa dữ liệu

app.delete('/api/learn_together/:id', (req, res) => {
    const { id } = req.params; // Lấy ID từ tham số URL

    // Câu lệnh SQL để xóa dữ liệu trong cơ sở dữ liệu
    const query = 'DELETE FROM learn_together WHERE id_learn = ?';

    // Thực thi câu lệnh SQL
    db.execute(query, [id], (err, result) => {
        if (err) {
            // Nếu có lỗi trong quá trình thực thi câu lệnh SQL
            return res.status(500).json({ error: 'Unable to delete the learn_together', details: err });
        }

        // Kiểm tra nếu không có bản ghi nào bị xóa (không tìm thấy ID tương ứng)
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'learn_together not found' });
        }

        // Trả về phản hồi thành công nếu xóa thành công
        res.status(200).json({
            message: 'exercises deleted successfully',
            deletedCount: result.affectedRows, // Số bản ghi đã bị xóa
        });
    });
});

// Api update dữ liệu
app.put('/api/learn_together/:id', (req, res) => {
    const { id } = req.params; // Get the ID from URL
    const { title_name, learn_link, language } = req.body; // Get the updated data from the request body

    // Check if all required fields are provided
    if (!title_name || !learn_link || !language) {
        return res.status(400).json({ error: 'All fields (title_name, learn_link, language ) are required' });
    }

    // SQL query to update the topic in the database
    const query = 'UPDATE learn_together SET title_name = ?, learn_link = ?, language = ? WHERE id_learn = ?';

    // Execute the query
    db.execute(query, [title_name, learn_link, language, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to update the learn_together ', details: err });
        }

        // If no rows are affected, return a message indicating no update was made
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'learn_together not found' });
        }

        // Success response
        res.status(200).json({
            message: 'learn_together updated successfully',
            updatedCount: result.affectedRows, // The number of rows updated
        });
    });
});


//exercise_segments

// API lấy danh sách dữ liệu english_expressions
app.get('/api/exercise_segments', (req, res) => {
    const sql = 'SELECT * FROM exercise_segments'; // Thay bằng tên bảng của bạn
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Lỗi khi truy vấn:', err.message);
            res.status(500).json({ error: 'Không thể lấy dữ liệu từ cơ sở dữ liệu' });
            return;
        }
        res.json(result);
    });
});

// API để thêm dữ liệu vào MySQL
app.post("/api/exercise_segments", (req, res) => {
    const { exercise_id, segment_number, audio_file, transcript } = req.body;

    // Kiểm tra nếu dữ liệu không đầy đủ
    if (!exercise_id || !segment_number || !audio_file || !transcript) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Câu lệnh SQL để thêm topic vào cơ sở dữ liệu
    const sql = "INSERT INTO exercise_segments (exercise_id, segment_number, audio_file, transcript) VALUES (?, ?, ?, ?)";

    db.query(sql, [exercise_id, segment_number, audio_file, transcript], (err, result) => {
        if (err) {
            console.error("Lỗi khi thêm learn_together:", err);
            return res.status(500).json({ error: "Database error" });
        }
        // Gửi phản hồi khi thêm thành công
        res.json({ message: "exercise_segments added successfully!", segment_id: result.insertId });
    });
});

// Xóa dữ liệu

app.delete('/api/exercise_segments/:id', (req, res) => {
    const { id } = req.params; // Lấy ID từ tham số URL

    // Câu lệnh SQL để xóa dữ liệu trong cơ sở dữ liệu
    const query = 'DELETE FROM exercise_segments WHERE segment_number = ?';

    // Thực thi câu lệnh SQL
    db.execute(query, [id], (err, result) => {
        if (err) {
            // Nếu có lỗi trong quá trình thực thi câu lệnh SQL
            return res.status(500).json({ error: 'Unable to delete the exercise_segments', details: err });
        }

        // Kiểm tra nếu không có bản ghi nào bị xóa (không tìm thấy ID tương ứng)
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'exercise_segments not found' });
        }

        // Trả về phản hồi thành công nếu xóa thành công
        res.status(200).json({
            message: 'exercise_segments deleted successfully',
            deletedCount: result.affectedRows, // Số bản ghi đã bị xóa
        });
    });
});

// Api update dữ liệu
app.put('/api/exercise_segments/:id', (req, res) => {
    const { id } = req.params; // Get the ID from URL
    const { exercise_id, segment_number, audio_file, transcript } = req.body; // Get the updated data from the request body

    // Check if all required fields are provided
    if (!exercise_id || !segment_number || !audio_file || !transcript) {
        return res.status(400).json({ error: 'All fields (exercise_id, segment_number, audio_file, transcript ) are required' });
    }

    // SQL query to update the topic in the database
    const query = 'UPDATE exercise_segments SET exercise_id = ?, segment_number = ?, audio_file = ?, transcript = ?  WHERE segment_number  = ?';

    // Execute the query
    db.execute(query, [exercise_id, segment_number, audio_file, transcript, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to update the exercise_segments ', details: err });
        }

        // If no rows are affected, return a message indicating no update was made
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'exercise_segments not found' });
        }

        // Success response
        res.status(200).json({
            message: 'exercise_segments updated successfully',
            updatedCount: result.affectedRows, // The number of rows updated
        });
    });
});


//Englishpronunciation

// API lấy danh sách dữ liệu english_pronunciation
app.get('/api/english_pronunciation', (req, res) => {
    const sql = 'SELECT * FROM english_pronunciation'; // Thay bằng tên bảng của bạn
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Lỗi khi truy vấn:', err.message);
            res.status(500).json({ error: 'Không thể lấy dữ liệu từ cơ sở dữ liệu' });
            return;
        }
        res.json(result);
    });
});

// API để thêm dữ liệu vào MySQL
app.post("/api/english_pronunciation", (req, res) => {
    const { pronun_name, video_file } = req.body;

    // Kiểm tra nếu dữ liệu không đầy đủ
    if (!pronun_name || !video_file) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Câu lệnh SQL để thêm topic vào cơ sở dữ liệu
    const sql = "INSERT INTO english_pronunciation (pronun_name, video_file) VALUES (?, ?)";

    db.query(sql, [pronun_name, video_file], (err, result) => {
        if (err) {
            console.error("Lỗi khi thêm learn_together:", err);
            return res.status(500).json({ error: "Database error" });
        }
        // Gửi phản hồi khi thêm thành công
        res.json({ message: "exercise_segments added successfully!", id_pronun: result.insertId });
    });
});

// Xóa dữ liệu

app.delete('/api/english_pronunciation/:id', (req, res) => {
    const { id } = req.params; // Lấy ID từ tham số URL

    // Câu lệnh SQL để xóa dữ liệu trong cơ sở dữ liệu
    const query = 'DELETE FROM english_pronunciation WHERE id_pronun = ?';

    // Thực thi câu lệnh SQL
    db.execute(query, [id], (err, result) => {
        if (err) {
            // Nếu có lỗi trong quá trình thực thi câu lệnh SQL
            return res.status(500).json({ error: 'Unable to delete the english_pronunciation', details: err });
        }

        // Kiểm tra nếu không có bản ghi nào bị xóa (không tìm thấy ID tương ứng)
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'english_pronunciation not found' });
        }

        // Trả về phản hồi thành công nếu xóa thành công
        res.status(200).json({
            message: 'exercise_segments deleted successfully',
            deletedCount: result.affectedRows, // Số bản ghi đã bị xóa
        });
    });
});

// Api update dữ liệu
app.put('/api/english_pronunciation/:id', (req, res) => {
    const { id } = req.params; // Get the ID from URL
    const { pronun_name, video_file } = req.body; // Get the updated data from the request body

    // Check if all required fields are provided
    if (!pronun_name || !video_file) {
        return res.status(400).json({ error: 'All fields (pronun_name, video_file ) are required' });
    }

    // SQL query to update the topic in the database
    const query = 'UPDATE english_pronunciation SET pronun_name = ?, video_file = ?  WHERE id_pronun  = ?';

    // Execute the query
    db.execute(query, [pronun_name, video_file, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to update the english_pronunciation ', details: err });
        }

        // If no rows are affected, return a message indicating no update was made
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'english_pronunciation not found' });
        }

        // Success response
        res.status(200).json({
            message: 'english_pronunciation updated successfully',
            updatedCount: result.affectedRows, // The number of rows updated
        });
    });
});


//users_account

// API để lấy dữ liệu từ public_profile và users_account

app.get('/api/users_account', (req, res) => {
    const sql = 'SELECT * FROM users_account'; // Thay bằng tên bảng của bạn
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Lỗi khi truy vấn:', err.message);
            res.status(500).json({ error: 'Không thể lấy dữ liệu từ cơ sở dữ liệu' });
            return;
        }
        res.json(result);
    });
});

// Xóa dữ liệu

app.delete('/api/users_account/:id', (req, res) => {
    const { id } = req.params; // Lấy ID từ tham số URL

    // Câu lệnh SQL để xóa dữ liệu trong cơ sở dữ liệu
    const query = 'DELETE FROM users_account WHERE user_id = ?';

    // Thực thi câu lệnh SQL
    db.execute(query, [id], (err, result) => {
        if (err) {
            // Nếu có lỗi trong quá trình thực thi câu lệnh SQL
            return res.status(500).json({ error: 'Unable to delete the users_account', details: err });
        }

        // Kiểm tra nếu không có bản ghi nào bị xóa (không tìm thấy ID tương ứng)
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'users_account not found' });
        }

        // Trả về phản hồi thành công nếu xóa thành công
        res.status(200).json({
            message: 'exercise_segments deleted successfully',
            deletedCount: result.affectedRows, // Số bản ghi đã bị xóa
        });
    });
});

// API để lấy dữ liệu từ public_profile và users_account
app.get('/api/public_profile', (req, res) => {
    const sql = `
    SELECT public_profile.*, users_account.username
    FROM public_profile
    JOIN users_account ON public_profile.user_id = users_account.user_id
    ORDER BY public_profile.active_time_hours DESC
  `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Lỗi khi truy vấn:', err.message);
            res.status(500).json({ error: 'Không thể lấy dữ liệu từ cơ sở dữ liệu' });
            return;
        }

        // Trả về kết quả với dữ liệu đã kết hợp từ hai bảng
        res.json(result);
    });
});
// Gửi mail thông báo
const nodemailer = require('nodemailer');
// Cấu hình Nodemailer để gửi email
const transporter = nodemailer.createTransport({
    service: 'gmail', // Hoặc dịch vụ email khác như 'outlook'
    auth: {
        user: 'choigamettg@gmail.com',
        pass: 'thuctap123'
    }
});


// Khởi động server
app.listen(port, () => {
    console.log(`Server chạy tại http://localhost:${port}`);
});
