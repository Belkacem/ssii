CREATE TRIGGER `set_invoice_number_before_insert`
    BEFORE INSERT ON `invoice`
    FOR EACH ROW
    SET
    new.zs_number = (
        SELECT COUNT(`inv_2`.`id`) + 1
        FROM `invoice` AS `inv_2`
        WHERE `inv_2`.`company_id` = new.company_id
              AND YEAR(`inv_2`.`issue_date`) = YEAR(new.issue_date)
    );
