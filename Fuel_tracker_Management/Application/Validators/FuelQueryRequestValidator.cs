
using Application.DTO;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Validators
{
    public class FuelQueryRequestValidator : AbstractValidator<FuelQueryRequest>
    {
        public FuelQueryRequestValidator()
        {
            RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 200);
            RuleFor(x => x.From).LessThanOrEqualTo(x => x.To).When(x => x.From != default && x.To != default);
        }
    }
}
