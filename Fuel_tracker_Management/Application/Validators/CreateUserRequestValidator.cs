using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Application.DTO.AuthDtos;


namespace Application.Validators
{
    public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
    {
        public CreateUserRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress()
                .WithMessage("A valid email is required.");

            RuleFor(x => x.Password)
                .NotEmpty()
                .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
                .Matches(@"[A-Za-z]+").WithMessage("Password must contain at least one letter.")
                .Matches(@"\d+").WithMessage("Password must contain at least one digit.");

            RuleFor(x => x.DisplayName).MaximumLength(200);
            RuleFor(x => x.PreferredCurrency).MaximumLength(8);
        }
    }
}
