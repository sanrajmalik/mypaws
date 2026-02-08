using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mypaws.Application.DTOs.Public;
using Mypaws.Infrastructure.Persistence;

namespace Mypaws.Api.Controllers;

[ApiController]
[Route("api/v1/public/pet-types")]
public class PetTypesController : ControllerBase
{
    private readonly MypawsDbContext _db;

    public PetTypesController(MypawsDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Get all pet types (Dog, Cat)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PetTypeDto>>> GetAll()
    {
        var petTypes = await _db.PetTypes
            .Where(pt => pt.IsActive)
            .OrderBy(pt => pt.DisplayOrder)
            .Select(pt => new PetTypeDto(
                pt.Id,
                pt.Name,
                pt.Slug,
                pt.PluralName,
                pt.IconUrl
            ))
            .ToListAsync();

        return Ok(petTypes);
    }
}
