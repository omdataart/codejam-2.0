using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Application.DTO.VehicleDtos;

namespace Application.Validators
{
    public class CreateVehicleRequestValidator : AbstractValidator<CreateVehicleRequest>
    {
        public CreateVehicleRequestValidator()
        {
            RuleFor(x => x.Label).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Make).MaximumLength(200).When(x => !string.IsNullOrEmpty(x.Make));
            RuleFor(x => x.Model).MaximumLength(200).When(x => !string.IsNullOrEmpty(x.Model));
            RuleFor(x => x.Year).InclusiveBetween(1900, DateTime.UtcNow.Year + 1).When(x => x.Year.HasValue);
            RuleFor(x => x.FuelType).MaximumLength(50).When(x => !string.IsNullOrEmpty(x.FuelType));
        }
    }

    //public class UpdateVehicleRequestValidator : AbstractValidator<UpdateVehicleRequest>
    //{
    //    public UpdateVehicleRequestValidator() => Include(new CreateVehicleRequestValidator());
    //}
}
