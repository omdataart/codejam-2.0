using API.Modules;
using Application;
using Application.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Add services to the container.
var sqlConnection = builder.Configuration.GetConnectionString("FuelTracker");
builder.Services.AddProjectDependencies(sqlConnection);

builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<AssemblyMarker>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // use HTTPS
        options.Cookie.SameSite = SameSiteMode.None; // required for cross-site
        options.LoginPath = "/api/auth/login";
        options.LogoutPath = "/api/auth/logout";
        options.ExpireTimeSpan = TimeSpan.FromDays(7);
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowCredentials() 
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        // 3. In terminal, run the following commands:
        // dotnet ef migrations add AddAuthEventTable
        // dotnet ef database update

        // 4. The line below ensures the database is created, but for schema changes, use migrations as above.
        ctx.Database.EnsureCreated();
    }
    catch
    {
        throw;
    }
}
    app.MapDefaultEndpoints();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("Fuel Tracker API running at: http://localhost:8000");
Console.WriteLine("==============================================");
Console.WriteLine($"Fuel Tracker UI running at :http://localhost:3000 ");
Console.WriteLine("==============================================");
app.Run();
