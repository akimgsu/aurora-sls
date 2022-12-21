CREATE TABLE `demo_serverless_appdev`.`tb_user` (
  `idx` INT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(45) NULL,
  `password` VARCHAR(200) NULL,
  `salt` VARCHAR(100) NULL,
  `rank` INT NULL,
  `registered_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idx`));
