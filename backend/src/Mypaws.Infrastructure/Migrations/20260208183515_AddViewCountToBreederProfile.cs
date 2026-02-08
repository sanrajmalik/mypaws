using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mypaws.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddViewCountToBreederProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ViewCount",
                table: "BreederProfiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ViewCount",
                table: "BreederProfiles");
        }
    }
}
