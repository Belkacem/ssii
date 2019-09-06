package com.zsoft.web.rest.extensions;


import com.zsoft.domain.User;
import com.zsoft.service.MailService;
import com.zsoft.service.extensions.UserServiceExt;
import com.zsoft.web.rest.errors.EmailAlreadyUsedException;
import com.zsoft.web.rest.errors.InvalidPasswordException;
import com.zsoft.web.rest.errors.LoginAlreadyUsedException;
import com.zsoft.web.rest.vm.ManagedUserVM;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api")
public class AccountResourceExt {

    private final Logger log = LoggerFactory.getLogger(AccountResourceExt.class);

    private final UserServiceExt userServiceExt;

    private final MailService mailService;

    public AccountResourceExt(UserServiceExt userServiceExt, MailService mailService) {
        this.userServiceExt = userServiceExt;
        this.mailService = mailService;
    }

    /**
     * POST  /register : register the user.
     *
     * @param managedUserVM the managed user View Model
     * @throws InvalidPasswordException  400 (Bad Request) if the password is incorrect
     * @throws EmailAlreadyUsedException 400 (Bad Request) if the email is already used
     * @throws LoginAlreadyUsedException 400 (Bad Request) if the login is already used
     */
    @PostMapping(value = "/register", params = {"ticket", "ticket-type"})
    @ResponseStatus(HttpStatus.CREATED)
    public void registerAccount(
        @RequestParam(value = "ticket-type", required = false) String ticketType,
        @RequestParam(value = "ticket", required = false) String ticket,
        @Valid @RequestBody ManagedUserVM managedUserVM
    ) {
        if (!checkPasswordLength(managedUserVM.getPassword())) {
            throw new InvalidPasswordException();
        }
        User user = userServiceExt.signupUser(managedUserVM, managedUserVM.getPassword(), ticket, ticketType);
        if (!user.getActivated()) {
            mailService.sendActivationEmail(user);
        }
    }

    private static boolean checkPasswordLength(String password) {
        return !StringUtils.isEmpty(password) &&
            password.length() >= ManagedUserVM.PASSWORD_MIN_LENGTH &&
            password.length() <= ManagedUserVM.PASSWORD_MAX_LENGTH;
    }
}
