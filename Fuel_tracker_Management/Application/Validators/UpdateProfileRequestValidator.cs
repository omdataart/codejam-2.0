using Application.DTO;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Validators
{
    public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
    {
        public UpdateProfileRequestValidator()
        {
            RuleFor(x => x.DisplayName).MaximumLength(200).When(x => !string.IsNullOrEmpty(x.DisplayName));
            RuleFor(x => x.PreferredCurrency).MaximumLength(8).When(x => !string.IsNullOrEmpty(x.PreferredCurrency));
            RuleFor(x => x.PreferredDistanceUnit).Must(x => x == "km" || x == "mi");
            RuleFor(x => x.PreferredVolumeUnit).Must(x => x == "L" || x == "gal");
            RuleFor(x => x.TimeZone).MaximumLength(100).When(x => !string.IsNullOrEmpty(x.TimeZone));
        }
    }
}
