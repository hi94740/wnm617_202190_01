CREATE TABLE IF NOT EXISTS `users` (
`id` INT NULL,
`name` VARCHAR(MAX) NULL,
`username` VARCHAR(MAX) NULL,
`password` VARCHAR(MAX) NULL,
`img` VARCHAR(MAX) NULL,
`date_create` VARCHAR(MAX) NULL
);

INSERT INTO users VALUES
(1,'Kristi Hewitt','user1',md5("pass"),'https://via.placeholder.com/400/7/fff/?text=user1','2020-07-24 05:02:13'),
(2,'Marisol Cash','user2',md5("pass"),'https://via.placeholder.com/400/331/fff/?text=user2','2020-10-24 04:05:15'),
(3,'Letitia Wise','user3',md5("pass"),'https://via.placeholder.com/400/265/fff/?text=user3','2020-08-12 03:42:10'),
(4,'Evelyn Mendez','user4',md5("pass"),'https://via.placeholder.com/400/668/fff/?text=user4','2021-09-08 06:32:07'),
(5,'Tammi Avery','user5',md5("pass"),'https://via.placeholder.com/400/223/fff/?text=user5','2020-05-17 01:31:21'),
(6,'Mcgee Sexton','user6',md5("pass"),'https://via.placeholder.com/400/919/fff/?text=user6','2021-06-12 05:23:34'),
(7,'Joanna Michael','user7',md5("pass"),'https://via.placeholder.com/400/48/fff/?text=user7','2021-01-04 02:31:39'),
(8,'Rene Daniels','user8',md5("pass"),'https://via.placeholder.com/400/926/fff/?text=user8','2021-07-17 04:40:16'),
(9,'Nell Simon','user9',md5("pass"),'https://via.placeholder.com/400/219/fff/?text=user9','2021-09-18 03:02:26'),
(10,'Mays Wong','user10',md5("pass"),'https://via.placeholder.com/400/825/fff/?text=user10','2020-06-04 08:52:19');