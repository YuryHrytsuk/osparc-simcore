/* ************************************************************************

   osparc - the simcore frontend

   https://osparc.io

   Copyright:
     2018 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Pedro Crespo (pcrespov)
     * Odei Maiz (odeimaiz)

************************************************************************ */

/**
 *  Main Authentication Page. A multi-page view that contains:
 *  - top-spacer
 *  - product logo
 *  - login stack (multi-page)
 *    - announcements (if any)
 *    - the login forms
 *    - disclaimer and extra widgets (if any)
 *  - bottom-spacer
 *  - footer
 */

qx.Class.define("osparc.auth.LoginWithDecorators", {
  extend: qx.ui.core.Widget,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct: function() {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.VBox(10));

    this.set({
      alignX: "center",
      alignY: "middle"
    });

    this.__buildLayout();
  },

  events: {
    "done": "qx.event.type.Data"
  },

  statics: {
    LOGO_WIDTH: 300,
    LOGO_HEIGHT: 90
  },

  members: {
    _createChildControlImpl: function(id) {
      let control;
      switch (id) {
        case "top-spacer":
          control = new qx.ui.core.Spacer().set({
            minHeight: 50,
          });
          this._add(control, {
            flex: 1
          });
          break;
        case "logo-w-platform": {
          control = new osparc.ui.basic.LogoWPlatform();
          const productLogoPath = osparc.product.Utils.getLogoPath();
          if (qx.util.ResourceManager.getInstance().getImageFormat(productLogoPath) === "png") {
            // png images don't scale keeping the aspect ratio
            const height = osparc.ui.basic.Logo.getHeightKeepingAspectRatio(productLogoPath, this.self().LOGO_WIDTH)
            control.setSize({
              width: this.self().LOGO_WIDTH,
              height
            });
          } else {
            control.setSize({
              width: this.self().LOGO_WIDTH,
              height: this.self().LOGO_HEIGHT
            });
          }
          control.setFont("text-18");
          this._add(control);
          break;
        }
        case "science-text-image":
          control = new qx.ui.basic.Image("osparc/Sim4Life_science_Subline.svg").set({
            width: this.self().LOGO_WIDTH,
            height: 24,
            scale: true,
            alignX: "center",
            marginTop: -25
          });
          this._add(control);
          break;
        case "pages-stack":
          control = new qx.ui.container.Stack().set({
            allowGrowX: false,
            alignX: "center",
            minHeight: 165,
          });
          this._add(control, {
            flex: 1
          });
          break;
        case "bottom-spacer":
          control = new qx.ui.core.Spacer().set({
            minHeight: 50,
          });
          this._add(control, {
            flex: 1
          });
          break;
        case "footer": {
          control = this.__getVersionLink();
          this._add(control);
          break;
        }
        case "login-view": {
          control = new osparc.auth.ui.LoginView();
          control.addListener("done", msg => {
            control.resetValues();
            this.fireDataEvent("done", msg);
          }, this);
          this.getChildControl("pages-stack").add(control);
          break;
        }
        case "registration-view": {
          control = new osparc.auth.ui.RegistrationView();
          this.getChildControl("pages-stack").add(control);
          break;
        }
        case "request-account": {
          control = new osparc.auth.ui.RequestAccount();
          this.getChildControl("pages-stack").add(control);
          break;
        }
        case "verify-phone-number-view": {
          control = new osparc.auth.ui.VerifyPhoneNumberView();
          this.getChildControl("pages-stack").add(control);
          break;
        }
        case "reset-password-request-view": {
          control = new osparc.auth.ui.ResetPassRequestView();
          this.getChildControl("pages-stack").add(control);
          break;
        }
        case "reset-password-view": {
          control = new osparc.auth.ui.ResetPassView();
          this.getChildControl("pages-stack").add(control);
          break;
        }
        case "login-2FA-validation-code-view": {
          control = new osparc.auth.ui.Login2FAValidationCodeView();
          this.getChildControl("pages-stack").add(control);
          break;
        }
      }
      return control || this.base(arguments, id);
    },

    __buildLayout: function() {
      this.getChildControl("top-spacer");
      const logo = this.getChildControl("logo-w-platform");
      if (osparc.product.Utils.isS4LProduct() || osparc.product.Utils.isProduct("s4llite")) {
        logo.setCursor("pointer");
        logo.addListener("tap", () => window.open("https://sim4life.swiss/", "_blank"));
      }
      if (osparc.product.Utils.isProduct("s4lacad")) {
        this.getChildControl("science-text-image");
      }
      this.__getLoginStack();
      this.getChildControl("bottom-spacer");
      this.getChildControl("footer");
    },

    __getLoginStack: function() {
      const pages = this.getChildControl("pages-stack");

      const login = this.getChildControl("login-view");
      const registration = this.getChildControl("registration-view");
      let requestAccount = null;
      if (osparc.product.Utils.getCreateAccountAction() === "REQUEST_ACCOUNT_FORM") {
        requestAccount = this.getChildControl("request-account");
      }
      const verifyPhoneNumber = this.getChildControl("verify-phone-number-view");
      const resetPasswordRequest = this.getChildControl("reset-password-request-view");
      const resetPassword = this.getChildControl("reset-password-view");
      const login2FAValidationCode = this.getChildControl("login-2FA-validation-code-view");

      // styling
      pages.getChildren().forEach(page => {
        page.getChildren().forEach(child => {
          if ("getChildren" in child) {
            child.getChildren().forEach(c => {
              // "Create account" and "Forgot password"
              c.set({
                textColor: "#ddd"
              });
            });
          }
        });
      });

      const page = osparc.auth.core.Utils.findParameterInFragment("page");
      const code = osparc.auth.core.Utils.findParameterInFragment("code");
      if (page === "reset-password" && code !== null) {
        pages.setSelection([resetPassword]);
      }

      const urlFragment = osparc.utils.Utils.parseURLFragment();
      if (urlFragment.nav && urlFragment.nav.length) {
        if (urlFragment.nav[0] === "registration") {
          pages.setSelection([registration]);
        } else if (urlFragment.nav[0] === "request-account") {
          requestAccount ? pages.setSelection([requestAccount]) : pages.setSelection([registration]);
        } else if (urlFragment.nav[0] === "reset-password") {
          pages.setSelection([resetPassword]);
        }
      } else if (urlFragment.params && urlFragment.params.registered) {
        osparc.FlashMessenger.logAs(this.tr("Your account has been created.<br>You can now use your credentials to login."));
      }

      login.addListener("toRegister", () => {
        pages.setSelection([registration]);
        login.resetValues();
      }, this);

      if (requestAccount) {
        login.addListener("toRequestAccount", () => {
          pages.setSelection([requestAccount]);
          login.resetValues();
        }, this);
      }

      login.addListener("toReset", () => {
        pages.setSelection([resetPasswordRequest]);
        login.resetValues();
      }, this);

      login.addListener("toVerifyPhone", e => {
        verifyPhoneNumber.set({
          userEmail: e.getData()
        });
        pages.setSelection([verifyPhoneNumber]);
        login.resetValues();
      }, this);

      login.addListener("to2FAValidationCode", e => {
        const data = e.getData();
        login2FAValidationCode.set({
          userEmail: data.userEmail,
          smsEnabled: true,
          message: data.message
        });
        if (data.nextStep === "SMS_CODE_REQUIRED") {
          login2FAValidationCode.restartSMSButton(data.retryAfter);
        } else if (data.nextStep === "EMAIL_CODE_REQUIRED") {
          login2FAValidationCode.restartEmailButton(data.retryAfter);
        }
        pages.setSelection([login2FAValidationCode]);
        login.resetValues();
      }, this);

      verifyPhoneNumber.addListener("skipPhoneRegistration", e => {
        const data = e.getData();
        login2FAValidationCode.set({
          userEmail: data.userEmail,
          smsEnabled: false,
          message: data.message
        });
        login2FAValidationCode.restartEmailButton(data.retryAfter);
        pages.setSelection([login2FAValidationCode]);
      }, this);

      login2FAValidationCode.addListener("done", msg => {
        login.resetValues();
        this.fireDataEvent("done", msg);
      }, this);

      registration.addListener("done", msg => {
        osparc.utils.Utils.cookie.deleteCookie("user");
        this.fireDataEvent("done", msg);
      });

      if (requestAccount) {
        requestAccount.addListener("done", msg => {
          osparc.utils.Utils.cookie.deleteCookie("user");
          this.fireDataEvent("done", msg);
        });
      }

      verifyPhoneNumber.addListener("done", msg => {
        login.resetValues();
        this.fireDataEvent("done", msg);
      }, this);

      [resetPasswordRequest, resetPassword].forEach(srcPage => {
        srcPage.addListener("done", msg => {
          pages.setSelection([login]);
          srcPage.resetValues();
        }, this);
      });

      return pages;
    },

    __getVersionLink: function() {
      const versionLinkLayout = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({
        alignX: "center"
      })).set({
        margin: [10, 0]
      });

      versionLinkLayout.add(new qx.ui.core.Spacer(), {
        flex: 1
      });

      const createReleaseNotesLink = osparc.utils.Utils.createReleaseNotesLink();
      createReleaseNotesLink.set({
        textColor: "text-darker"
      });
      versionLinkLayout.add(createReleaseNotesLink);

      const organizationLink = new osparc.ui.basic.LinkLabel().set({
        textColor: "text-darker"
      });
      const vendor = osparc.store.VendorInfo.getInstance().getVendor();
      if (vendor && "url" in vendor && "copyright" in vendor) {
        organizationLink.set({
          value: vendor.copyright,
          url: vendor.url
        });
      }
      versionLinkLayout.add(organizationLink);

      versionLinkLayout.add(new qx.ui.core.Spacer(), {
        flex: 1
      });

      return versionLinkLayout;
    },
  }
});
