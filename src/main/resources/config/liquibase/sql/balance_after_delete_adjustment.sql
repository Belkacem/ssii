DROP TRIGGER IF EXISTS `balance_after_delete_adjustment`;
CREATE TRIGGER `balance_after_delete_adjustment`
    AFTER DELETE
    ON `absence_balance_adjustment`
    FOR EACH ROW
    UPDATE `absence_balance`
    SET
        `absence_balance`.`balance` = (SELECT COALESCE(SUM(`aba1`.balance),0)
                                       FROM `absence_balance_adjustment` `aba1`
                                       WHERE `aba1`.absence_balance_id = old.absence_balance_id),
        `absence_balance`.`taken`   = (SELECT COALESCE(SUM(`aba2`.balance),0)
                                       FROM `absence_balance_adjustment` `aba2`
                                       WHERE `aba2`.absence_balance_id = old.absence_balance_id AND `aba2`.balance < 0)
    WHERE `absence_balance`.`id` = old.absence_balance_id;

