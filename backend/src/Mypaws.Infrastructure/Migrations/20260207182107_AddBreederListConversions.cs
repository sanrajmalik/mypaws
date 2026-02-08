using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mypaws.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBreederListConversions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "GalleryUrls",
                table: "BreederProfiles",
                type: "text",
                nullable: false,
                oldClrType: typeof(List<string>),
                oldType: "text[]");

            migrationBuilder.AlterColumn<string>(
                name: "BreedIds",
                table: "BreederProfiles",
                type: "text",
                nullable: false,
                oldClrType: typeof(List<Guid>),
                oldType: "uuid[]");

            migrationBuilder.AlterColumn<string>(
                name: "Includes",
                table: "BreederListings",
                type: "text",
                nullable: false,
                oldClrType: typeof(List<string>),
                oldType: "text[]");

            migrationBuilder.AlterColumn<string>(
                name: "BreedIds",
                table: "BreederApplications",
                type: "text",
                nullable: false,
                oldClrType: typeof(List<Guid>),
                oldType: "uuid[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<List<string>>(
                name: "GalleryUrls",
                table: "BreederProfiles",
                type: "text[]",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<List<Guid>>(
                name: "BreedIds",
                table: "BreederProfiles",
                type: "uuid[]",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<List<string>>(
                name: "Includes",
                table: "BreederListings",
                type: "text[]",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<List<Guid>>(
                name: "BreedIds",
                table: "BreederApplications",
                type: "uuid[]",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
