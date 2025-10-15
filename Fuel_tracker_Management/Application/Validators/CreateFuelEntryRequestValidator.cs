
using Application.DTO;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Validators
{
    public class CreateFuelEntryRequestValidator : AbstractValidator<CreateFuelEntryRequest>
    {
        public CreateFuelEntryRequestValidator()
        {
            RuleFor(x => x.VehicleId).GreaterThan(0);
            RuleFor(x => x.Date).LessThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("Date cannot be in the future.");
            RuleFor(x => x.OdometerKm).GreaterThanOrEqualTo(0);
            RuleFor(x => x.Liters).GreaterThan(0).WithMessage("Liters must be greater than zero.");
            RuleFor(x => x.TotalAmount).GreaterThan(0).WithMessage("Total amount must be greater than zero.");
            RuleFor(x => x.Notes).MaximumLength(500).When(x => !string.IsNullOrEmpty(x.Notes));
            RuleFor(x => x.Grade).MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Grade));
            RuleFor(x => x.Brand).MaximumLength(200).When(x => !string.IsNullOrEmpty(x.Brand));
            RuleFor(x => x.Station).MaximumLength(250).When(x => !string.IsNullOrEmpty(x.Station));
        }
    }
    public class UpdateFuelEntryRequestValidator : AbstractValidator<UpdateFuelEntryRequest>
    {
        public UpdateFuelEntryRequestValidator()
        {
            RuleFor(x => x.Date).LessThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("Date cannot be in the future.");
            RuleFor(x => x.OdometerKm).GreaterThanOrEqualTo(0);
            RuleFor(x => x.Liters).GreaterThan(0);
            RuleFor(x => x.TotalAmount).GreaterThan(0);
            RuleFor(x => x.Notes).MaximumLength(500).When(x => !string.IsNullOrEmpty(x.Notes));
        }
    }
}
