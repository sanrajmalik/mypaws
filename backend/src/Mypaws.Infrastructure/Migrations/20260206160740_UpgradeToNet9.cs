using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mypaws.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpgradeToNet9 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AdoptionListings_Cities_CityId",
                table: "AdoptionListings");

            migrationBuilder.DropForeignKey(
                name: "FK_AdoptionListings_Users_OwnerId",
                table: "AdoptionListings");

            migrationBuilder.DropForeignKey(
                name: "FK_Pets_Breeds_BreedId",
                table: "Pets");

            migrationBuilder.DropIndex(
                name: "IX_AdoptionListings_Status_CityId",
                table: "AdoptionListings");

            migrationBuilder.DropColumn(
                name: "GoodWithCats",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "GoodWithDogs",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "GoodWithKids",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "MediumUrl",
                table: "PetImages");

            migrationBuilder.DropColumn(
                name: "State",
                table: "Cities");

            migrationBuilder.DropColumn(
                name: "StateSlug",
                table: "Cities");

            migrationBuilder.DropColumn(
                name: "AdoptionRequirements",
                table: "AdoptionListings");

            migrationBuilder.DropColumn(
                name: "Area",
                table: "AdoptionListings");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "AdoptionListings");

            migrationBuilder.RenameColumn(
                name: "Size",
                table: "Pets",
                newName: "VaccinationDetails");

            migrationBuilder.RenameColumn(
                name: "HealthNotes",
                table: "Pets",
                newName: "Temperament");

            migrationBuilder.RenameColumn(
                name: "Url",
                table: "PetImages",
                newName: "ThumbUrl");

            migrationBuilder.RenameColumn(
                name: "ThumbnailUrl",
                table: "PetImages",
                newName: "BlurHash");

            migrationBuilder.RenameColumn(
                name: "IsMetro",
                table: "Cities",
                newName: "IsFeatured");

            migrationBuilder.RenameColumn(
                name: "DisplayOrder",
                table: "Cities",
                newName: "BreederCount");

            migrationBuilder.RenameColumn(
                name: "Temperament",
                table: "Breeds",
                newName: "SizeCategory");

            migrationBuilder.RenameColumn(
                name: "Size",
                table: "Breeds",
                newName: "OriginCountry");

            migrationBuilder.RenameColumn(
                name: "PetType",
                table: "Breeds",
                newName: "BreederCount");

            migrationBuilder.RenameColumn(
                name: "Origin",
                table: "Breeds",
                newName: "MetaTitle");

            migrationBuilder.RenameColumn(
                name: "LifeSpan",
                table: "Breeds",
                newName: "MetaDescription");

            migrationBuilder.RenameColumn(
                name: "RequiresHomeVisit",
                table: "AdoptionListings",
                newName: "IsPaid");

            migrationBuilder.RenameColumn(
                name: "RejectReason",
                table: "AdoptionListings",
                newName: "RejectionReason");

            migrationBuilder.RenameColumn(
                name: "Pincode",
                table: "AdoptionListings",
                newName: "AdopterRequirements");

            migrationBuilder.RenameColumn(
                name: "OwnerId",
                table: "AdoptionListings",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "ContactCount",
                table: "AdoptionListings",
                newName: "InquiryCount");

            migrationBuilder.RenameIndex(
                name: "IX_AdoptionListings_OwnerId",
                table: "AdoptionListings",
                newName: "IX_AdoptionListings_UserId");

            migrationBuilder.AlterColumn<bool>(
                name: "IsVaccinated",
                table: "Pets",
                type: "boolean",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AlterColumn<bool>(
                name: "IsNeutered",
                table: "Pets",
                type: "boolean",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AlterColumn<string>(
                name: "Gender",
                table: "Pets",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<Guid>(
                name: "BreedId",
                table: "Pets",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "CityId",
                table: "Pets",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string[]>(
                name: "FunFacts",
                table: "Pets",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PetTypeId",
                table: "Pets",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "RescueStory",
                table: "Pets",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SizeCategory",
                table: "Pets",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Pets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "FileSize",
                table: "PetImages",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Height",
                table: "PetImages",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LargeUrl",
                table: "PetImages",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OriginalUrl",
                table: "PetImages",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "PetImages",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Width",
                table: "PetImages",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Longitude",
                table: "Cities",
                type: "numeric(11,8)",
                precision: 11,
                scale: 8,
                nullable: true,
                oldClrType: typeof(double),
                oldType: "double precision",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Latitude",
                table: "Cities",
                type: "numeric(10,8)",
                precision: 10,
                scale: 8,
                nullable: true,
                oldClrType: typeof(double),
                oldType: "double precision",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AdoptionCount",
                table: "Cities",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Cities",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "MetaDescription",
                table: "Cities",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MetaTitle",
                table: "Cities",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StateId",
                table: "Cities",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "AdoptionCount",
                table: "Breeds",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Breeds",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "LifeExpectancyMax",
                table: "Breeds",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LifeExpectancyMin",
                table: "Breeds",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PetTypeId",
                table: "Breeds",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));



            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "AdoptionListings",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<Guid>(
                name: "CityId",
                table: "AdoptionListings",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<DateTime>(
                name: "AdoptedAt",
                table: "AdoptionListings",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "AdoptionFee",
                table: "AdoptionListings",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FeaturedUntil",
                table: "AdoptionListings",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string[]>(
                name: "FeeIncludes",
                table: "AdoptionListings",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HomeCheckRequired",
                table: "AdoptionListings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsFeatured",
                table: "AdoptionListings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "PaymentId",
                table: "AdoptionListings",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Countries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    IsoCode = table.Column<string>(type: "text", nullable: false),
                    PhoneCode = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Countries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PetFaqs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PetId = table.Column<Guid>(type: "uuid", nullable: false),
                    Question = table.Column<string>(type: "text", nullable: false),
                    Answer = table.Column<string>(type: "text", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PetFaqs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PetFaqs_Pets_PetId",
                        column: x => x.PetId,
                        principalTable: "Pets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PetTypes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    PluralName = table.Column<string>(type: "text", nullable: false),
                    IconUrl = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PetTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "States",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CountryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    StateCode = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_States", x => x.Id);
                    table.ForeignKey(
                        name: "FK_States_Countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Pets_CityId",
                table: "Pets",
                column: "CityId");

            migrationBuilder.CreateIndex(
                name: "IX_Pets_PetTypeId",
                table: "Pets",
                column: "PetTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Pets_Slug",
                table: "Pets",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cities_StateId",
                table: "Cities",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_Breeds_PetTypeId",
                table: "Breeds",
                column: "PetTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AdoptionListings_Status",
                table: "AdoptionListings",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_PetFaqs_PetId",
                table: "PetFaqs",
                column: "PetId");

            migrationBuilder.CreateIndex(
                name: "IX_PetTypes_Slug",
                table: "PetTypes",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_States_CountryId",
                table: "States",
                column: "CountryId");

            migrationBuilder.AddForeignKey(
                name: "FK_AdoptionListings_Cities_CityId",
                table: "AdoptionListings",
                column: "CityId",
                principalTable: "Cities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AdoptionListings_Users_UserId",
                table: "AdoptionListings",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Breeds_PetTypes_PetTypeId",
                table: "Breeds",
                column: "PetTypeId",
                principalTable: "PetTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Cities_States_StateId",
                table: "Cities",
                column: "StateId",
                principalTable: "States",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Pets_Breeds_BreedId",
                table: "Pets",
                column: "BreedId",
                principalTable: "Breeds",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Pets_Cities_CityId",
                table: "Pets",
                column: "CityId",
                principalTable: "Cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Pets_PetTypes_PetTypeId",
                table: "Pets",
                column: "PetTypeId",
                principalTable: "PetTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AdoptionListings_Cities_CityId",
                table: "AdoptionListings");

            migrationBuilder.DropForeignKey(
                name: "FK_AdoptionListings_Users_UserId",
                table: "AdoptionListings");

            migrationBuilder.DropForeignKey(
                name: "FK_Breeds_PetTypes_PetTypeId",
                table: "Breeds");

            migrationBuilder.DropForeignKey(
                name: "FK_Cities_States_StateId",
                table: "Cities");

            migrationBuilder.DropForeignKey(
                name: "FK_Pets_Breeds_BreedId",
                table: "Pets");

            migrationBuilder.DropForeignKey(
                name: "FK_Pets_Cities_CityId",
                table: "Pets");

            migrationBuilder.DropForeignKey(
                name: "FK_Pets_PetTypes_PetTypeId",
                table: "Pets");

            migrationBuilder.DropTable(
                name: "PetFaqs");

            migrationBuilder.DropTable(
                name: "PetTypes");

            migrationBuilder.DropTable(
                name: "States");

            migrationBuilder.DropTable(
                name: "Countries");

            migrationBuilder.DropIndex(
                name: "IX_Pets_CityId",
                table: "Pets");

            migrationBuilder.DropIndex(
                name: "IX_Pets_PetTypeId",
                table: "Pets");

            migrationBuilder.DropIndex(
                name: "IX_Pets_Slug",
                table: "Pets");

            migrationBuilder.DropIndex(
                name: "IX_Cities_StateId",
                table: "Cities");

            migrationBuilder.DropIndex(
                name: "IX_Breeds_PetTypeId",
                table: "Breeds");

            migrationBuilder.DropIndex(
                name: "IX_AdoptionListings_Status",
                table: "AdoptionListings");

            migrationBuilder.DropColumn(
                name: "CityId",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "FunFacts",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "PetTypeId",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "RescueStory",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "SizeCategory",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "FileSize",
                table: "PetImages");

            migrationBuilder.DropColumn(
                name: "Height",
                table: "PetImages");

            migrationBuilder.DropColumn(
                name: "LargeUrl",
                table: "PetImages");

            migrationBuilder.DropColumn(
                name: "OriginalUrl",
                table: "PetImages");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "PetImages");

            migrationBuilder.DropColumn(
                name: "Width",
                table: "PetImages");

            migrationBuilder.DropColumn(
                name: "AdoptionCount",
                table: "Cities");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Cities");

            migrationBuilder.DropColumn(
                name: "MetaDescription",
                table: "Cities");

            migrationBuilder.DropColumn(
                name: "MetaTitle",
                table: "Cities");

            migrationBuilder.DropColumn(
                name: "StateId",
                table: "Cities");

            migrationBuilder.DropColumn(
                name: "AdoptionCount",
                table: "Breeds");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Breeds");

            migrationBuilder.DropColumn(
                name: "LifeExpectancyMax",
                table: "Breeds");

            migrationBuilder.DropColumn(
                name: "LifeExpectancyMin",
                table: "Breeds");

            migrationBuilder.DropColumn(
                name: "PetTypeId",
                table: "Breeds");

            migrationBuilder.DropColumn(
                name: "AdoptedAt",
                table: "AdoptionListings");

            migrationBuilder.DropColumn(
                name: "AdoptionFee",
                table: "AdoptionListings");

            migrationBuilder.DropColumn(
                name: "FeaturedUntil",
                table: "AdoptionListings");

            migrationBuilder.DropColumn(
                name: "FeeIncludes",
                table: "AdoptionListings");

            migrationBuilder.DropColumn(
                name: "HomeCheckRequired",
                table: "AdoptionListings");

            migrationBuilder.DropColumn(
                name: "IsFeatured",
                table: "AdoptionListings");

            migrationBuilder.DropColumn(
                name: "PaymentId",
                table: "AdoptionListings");

            migrationBuilder.RenameColumn(
                name: "VaccinationDetails",
                table: "Pets",
                newName: "Size");

            migrationBuilder.RenameColumn(
                name: "Temperament",
                table: "Pets",
                newName: "HealthNotes");

            migrationBuilder.RenameColumn(
                name: "ThumbUrl",
                table: "PetImages",
                newName: "Url");

            migrationBuilder.RenameColumn(
                name: "BlurHash",
                table: "PetImages",
                newName: "ThumbnailUrl");

            migrationBuilder.RenameColumn(
                name: "IsFeatured",
                table: "Cities",
                newName: "IsMetro");

            migrationBuilder.RenameColumn(
                name: "BreederCount",
                table: "Cities",
                newName: "DisplayOrder");

            migrationBuilder.RenameColumn(
                name: "SizeCategory",
                table: "Breeds",
                newName: "Temperament");

            migrationBuilder.RenameColumn(
                name: "OriginCountry",
                table: "Breeds",
                newName: "Size");

            migrationBuilder.RenameColumn(
                name: "MetaTitle",
                table: "Breeds",
                newName: "Origin");

            migrationBuilder.RenameColumn(
                name: "MetaDescription",
                table: "Breeds",
                newName: "LifeSpan");

            migrationBuilder.RenameColumn(
                name: "BreederCount",
                table: "Breeds",
                newName: "PetType");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "AdoptionListings",
                newName: "OwnerId");

            migrationBuilder.RenameColumn(
                name: "RejectionReason",
                table: "AdoptionListings",
                newName: "RejectReason");

            migrationBuilder.RenameColumn(
                name: "IsPaid",
                table: "AdoptionListings",
                newName: "RequiresHomeVisit");

            migrationBuilder.RenameColumn(
                name: "InquiryCount",
                table: "AdoptionListings",
                newName: "ContactCount");

            migrationBuilder.RenameColumn(
                name: "AdopterRequirements",
                table: "AdoptionListings",
                newName: "Pincode");

            migrationBuilder.RenameIndex(
                name: "IX_AdoptionListings_UserId",
                table: "AdoptionListings",
                newName: "IX_AdoptionListings_OwnerId");

            migrationBuilder.AlterColumn<bool>(
                name: "IsVaccinated",
                table: "Pets",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsNeutered",
                table: "Pets",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Gender",
                table: "Pets",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<Guid>(
                name: "BreedId",
                table: "Pets",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "GoodWithCats",
                table: "Pets",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "GoodWithDogs",
                table: "Pets",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "GoodWithKids",
                table: "Pets",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Pets",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "MediumUrl",
                table: "PetImages",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "Longitude",
                table: "Cities",
                type: "double precision",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(11,8)",
                oldPrecision: 11,
                oldScale: 8,
                oldNullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "Latitude",
                table: "Cities",
                type: "double precision",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,8)",
                oldPrecision: 10,
                oldScale: 8,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "State",
                table: "Cities",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StateSlug",
                table: "Cities",
                type: "text",
                nullable: false,
                defaultValue: "");



            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "AdoptionListings",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<Guid>(
                name: "CityId",
                table: "AdoptionListings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdoptionRequirements",
                table: "AdoptionListings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Area",
                table: "AdoptionListings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "AdoptionListings",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AdoptionListings_Status_CityId",
                table: "AdoptionListings",
                columns: new[] { "Status", "CityId" });

            migrationBuilder.AddForeignKey(
                name: "FK_AdoptionListings_Cities_CityId",
                table: "AdoptionListings",
                column: "CityId",
                principalTable: "Cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AdoptionListings_Users_OwnerId",
                table: "AdoptionListings",
                column: "OwnerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Pets_Breeds_BreedId",
                table: "Pets",
                column: "BreedId",
                principalTable: "Breeds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
