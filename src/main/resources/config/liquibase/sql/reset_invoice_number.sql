UPDATE `invoice`
    LEFT JOIN (
                  SELECT
                      `inv_1`.`id`              AS `inv_id`,
                      (COUNT(`inv_2`.`id`) + 1) AS `total`
                  FROM `invoice` AS `inv_1`
                      LEFT JOIN `invoice` `inv_2` ON `inv_2`.`company_id` = `inv_1`.`company_id` AND
                                                     YEAR(`inv_2`.`issue_date`) = YEAR(`inv_1`.`issue_date`) AND
                                                     `inv_2`.`id` < `inv_1`.`id`
                  GROUP BY `inv_1`.`id`
              ) AS `counter` ON `id` = `counter`.`inv_id`
SET `zs_number` = `counter`.`total`;
